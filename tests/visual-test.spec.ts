import { test, expect } from '@playwright/test';

test('visual comparison test with timing', async ({ page }) => {
    // Array to store timing data
    const timings = [{}];
    
    // Function to measure execution time
    async function measureTime(fn, label) {
        const start = process.hrtime.bigint();
        await fn();
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e6; // Convert to milliseconds
        timings.push({ label, duration });
        console.log(`${label}: ${duration.toFixed(2)}ms`);
    }

    // Navigate to the page
    await measureTime(async () => {
        await page.goto('https://example.com');
        // Wait for any animations or dynamic content to settle
        await page.waitForLoadState('networkidle');
    }, 'Page Navigation');

    // Take a screenshot of the entire page
    await measureTime(async () => {
        await expect(page).toHaveScreenshot('full-page.png', {
            fullPage: true,
            timeout: 10000,
            animations: 'disabled',
            mask: [page.locator('.dynamic-content')], // Mask dynamic elements
            threshold: 0.2 // Allow 0.2% pixel difference
        });
    }, 'Full Page Screenshot Comparison');

    // Take screenshot of specific element
    await measureTime(async () => {
        const element = page.locator('h1');
        await expect(element).toHaveScreenshot('header.png', {
            timeout: 5000,
            animations: 'disabled',
            threshold: 0.1
        });
    }, 'Element Screenshot Comparison');

    // Multiple element screenshots
    await measureTime(async () => {
        const elements = await page.locator('p').all();
        for (let i = 0; i < elements.length; i++) {
            await expect(elements[i]).toHaveScreenshot(`paragraph-${i}.png`, {
                timeout: 5000,
                animations: 'disabled',
                threshold: 0.1
            });
        }
    }, 'Multiple Elements Screenshot Comparison');

    // Output timing summary
    console.log('\nTiming Summary:');
    console.table(timings);
});

// Test for comparing specific regions
test('region comparison test', async ({ page }) => {
    const timings = [{}];
    
    async function measureTime(fn, label) {
        const start = process.hrtime.bigint();
        await fn();
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e6;
        timings.push({ label, duration });
        console.log(`${label}: ${duration.toFixed(2)}ms`);
    }

    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');

    // Compare specific regions of the page
    await measureTime(async () => {
        await expect(page).toHaveScreenshot('region.png', {
            clip: {
                x: 0,
                y: 0,
                width: 500,
                height: 500
            },
            timeout: 5000,
            animations: 'disabled',
            threshold: 0.1
        });
    }, 'Region Screenshot Comparison');

    // Compare multiple regions
    await measureTime(async () => {
        const regions = [
            { x: 0, y: 0, width: 200, height: 200 },
            { x: 200, y: 0, width: 200, height: 200 },
            { x: 0, y: 200, width: 200, height: 200 }
        ];

        for (let i = 0; i < regions.length; i++) {
            await expect(page).toHaveScreenshot(`region-${i}.png`, {
                clip: regions[i],
                timeout: 5000,
                animations: 'disabled',
                threshold: 0.1
            });
        }
    }, 'Multiple Regions Screenshot Comparison');

    console.log('\nTiming Summary:');
    console.table(timings);
});

// Configuration for the visual comparison
const config = {
    expect: {
        toHaveScreenshot: {
            // Maximum time to wait for screenshot comparison
            timeout: 10000,
            
            // Default threshold for pixel differences (0.2%)
            threshold: 0.2,
            
            // Maximum pixels that can differ
            maxDiffPixels: 100,
            
            // Disable animations during screenshot
            animations: 'disabled',
            
            // Comparison options
            comparatorOptions: {
                maxDiffPixelRatio: 0.002,
                threshold: 0.2,
            }
        }
    }
};

export default config;