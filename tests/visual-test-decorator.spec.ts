import { test, expect, Page } from '@playwright/test';

// Decorator function to measure execution time
function measureExecutionTime(timingsArray) {
    return function(target, context) {
        // Return a new function that wraps the original
        return async function(...args) {
            const start = process.hrtime.bigint();
            
            try {
                // Execute the original function
                const result = await target.apply(this, args);
                return result;
            } finally {
                const end = process.hrtime.bigint();
                const duration = Number(end - start) / 1e6; // Convert to milliseconds
                
                // Get the function name or custom label from context
                const label = context?.name || target.name || 'Anonymous Function';
                
                // Store timing data
                timingsArray.push({ label, duration });
                console.log(`${label}: ${duration.toFixed(2)}ms`);
            }
        };
    };
}

// Example usage in your test
test('visual comparison test with timing decorator', async ({ page }) => {
    const timings = [];
    
    // Helper class to organize screenshot functions
    class ScreenshotCapture {
        private page: Page;
        constructor(page: Page) {
            this.page = page;
        }
        @measureExecutionTime(timings)
        async captureFullPage() {
            await this.page.goto('https://example.com');
            await this.page.waitForLoadState('networkidle');
            
            await expect(this.page).toHaveScreenshot('full-page.png', {
                fullPage: true,
                timeout: 10000,
                animations: 'disabled',
                mask: [this.page.locator('.dynamic-content')],
                threshold: 0.2
            });
        }
        
        @measureExecutionTime(timings)
        async captureElement(selector, filename) {
            const element = this.page.locator(selector);
            await expect(element).toHaveScreenshot(filename, {
                timeout: 5000,
                animations: 'disabled',
                threshold: 0.1
            });
        }
        
        @measureExecutionTime(timings)
        async captureMultipleElements(selector, filenamePrefix) {
            const elements = await this.page.locator(selector).all();
            for (let i = 0; i < elements.length; i++) {
                await expect(elements[i]).toHaveScreenshot(`${filenamePrefix}-${i}.png`, {
                    timeout: 5000,
                    animations: 'disabled',
                    threshold: 0.1
                });
            }
        }
    }
    
    const screenshotCapture = new ScreenshotCapture(page);
    
    // Execute the tests
    await screenshotCapture.captureFullPage();
    await screenshotCapture.captureElement('h1', 'header.png');
    await screenshotCapture.captureMultipleElements('p', 'paragraph');
    
    // Output timing summary
    console.log('\nTiming Summary:');
    console.table(timings);
});