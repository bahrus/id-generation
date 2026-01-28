import { test, expect } from '@playwright/test';

test.describe('Side Effects', () => {
    test('should apply name and class side effects', async ({ page }) => {
        await page.goto('/tests/side-effects.html');
        await page.waitForTimeout(100);
        
        const input = await page.locator('[data-id="lhs"]');
        
        // Check name attribute was added
        const name = await input.getAttribute('name');
        expect(name).toBe('lhs');
        
        // Check class was added (preserving existing)
        const className = await input.getAttribute('class');
        expect(className).toContain('my-class');
        expect(className).toContain('lhs');
    });
    
    test('should apply itemprop and part side effects', async ({ page }) => {
        await page.goto('/tests/side-effects.html');
        await page.waitForTimeout(100);
        
        const span = await page.locator('[data-id="rhs"]');
        
        // Check itemprop was added
        const itemprop = await span.getAttribute('itemprop');
        expect(itemprop).toBe('rhs');
        
        // Check part was added (preserving existing)
        const part = await span.getAttribute('part');
        expect(part).toContain('my-part');
        expect(part).toContain('rhs');
    });
});
