import { test, expect } from '@playwright/test';

test.describe('Basic ID Generation', () => {
    test('should generate IDs for data-id attributes', async ({ page }) => {
        await page.goto('/tests/basic.html');
        
        // Wait for script to execute
        await page.waitForTimeout(100);
        
        // Check that IDs were generated
        const input1 = await page.locator('[data-id="lhs"]');
        const id1 = await input1.getAttribute('id');
        expect(id1).toMatch(/^gid-\d+$/);
        
        const input2 = await page.locator('[data-id="rhs"]');
        const id2 = await input2.getAttribute('id');
        expect(id2).toMatch(/^gid-\d+$/);
        
        // Check that references were replaced
        const template = await page.locator('template');
        const attr = await template.getAttribute('🎚️');
        expect(attr).toContain(`#${id1}`);
        expect(attr).toContain(`#${id2}`);
        
        // Check that -id attribute was removed
        const hasIdAttr = await template.evaluate(el => el.hasAttribute('-id'));
        expect(hasIdAttr).toBe(false);
    });
    
    test('should handle fieldset scope', async ({ page }) => {
        await page.goto('/tests/basic.html');
        await page.waitForTimeout(100);
        
        // Check that disabled was removed from fieldset
        const fieldset = await page.locator('fieldset').first();
        const isDisabled = await fieldset.evaluate(el => el.hasAttribute('disabled'));
        expect(isDisabled).toBe(false);
    });
});
