import { test, expect } from '@playwright/test';

test('Visual comparison test with timing of full page', async ({ page }) => {
    const timings = [{}];
    
    async function measureTime(fn, label) {
        const start = process.hrtime.bigint();
        await fn();
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e6;
        timings.push({ label, duration });
    }

    await measureTime(async () => {
        await page.goto('https://example.com');
        await page.waitForLoadState('networkidle');
    }, 'Page Navigation');

    // Take a screenshot of the entire page
    await measureTime(async () => {
        await expect(page).toHaveScreenshot('full-page.png', {
            fullPage: true,
            timeout: 10000,
            animations: 'disabled',
            mask: [page.locator('.dynamic-content')],
            threshold: 0.2 
        });
    }, 'Full Page Screenshot Comparison');

    await measureTime(async () => {
        const element = page.locator('h1');
        await expect(element).toHaveScreenshot('header.png', {
            timeout: 5000,
            animations: 'disabled',
            threshold: 0.1
        });
    }, 'Element Screenshot Comparison');

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

    console.log('\nTiming Summary:');
    console.table(timings);
});

test('Visual comparison test with timing of clipped region comparison', async ({ page }) => {
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
    }, 'Clipped Region Screenshot Comparison');

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