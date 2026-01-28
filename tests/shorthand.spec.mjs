import { test, expect } from '@playwright/test';

test.describe('Shorthand Attributes', () => {
    test('should generate ID from tag name with # attribute', async ({ page }) => {
        await page.goto('/tests/shorthand.html');
        await page.waitForTimeout(100);
        
        const element1 = await page.locator('carrot-nosed-woman');
        const id1 = await element1.getAttribute('id');
        expect(id1).toMatch(/^gid-\d+$/);
        
        const dataId1 = await element1.getAttribute('data-id');
        expect(dataId1).toBe('carrot-nosed-woman');
        
        // Check # attribute was removed
        const hasHash = await element1.evaluate(el => el.hasAttribute('#'));
        expect(hasHash).toBe(false);
    });
    
    test('should generate ID from name attribute with @ attribute', async ({ page }) => {
        await page.goto('/tests/shorthand.html');
        await page.waitForTimeout(100);
        
        const input = await page.locator('input[name="isHappy"]');
        const id = await input.getAttribute('id');
        expect(id).toMatch(/^gid-\d+$/);
        
        const dataId = await input.getAttribute('data-id');
        expect(dataId).toBe('isHappy');
        
        // Check @ attribute was removed
        const hasAt = await input.evaluate(el => el.hasAttribute('@'));
        expect(hasAt).toBe(false);
    });
    
    test('should generate ID from itemprop attribute with | attribute', async ({ page }) => {
        await page.goto('/tests/shorthand.html');
        await page.waitForTimeout(100);
        
        const data = await page.locator('data[itemprop="isHappy"]');
        const id = await data.getAttribute('id');
        expect(id).toMatch(/^gid-\d+$/);
        
        const dataId = await data.getAttribute('data-id');
        expect(dataId).toBe('isHappy');
        
        // Check | attribute was removed
        const hasPipe = await data.evaluate(el => el.hasAttribute('|'));
        expect(hasPipe).toBe(false);
    });
});
