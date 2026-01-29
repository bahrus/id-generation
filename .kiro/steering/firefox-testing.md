---
inclusion: always
---

# Firefox Testing Notes

## Status: Firefox Removed from Test Matrix

Firefox has been **removed from the test configuration** until it supports modern JavaScript features required by this library.

## Reason for Removal

The Playwright Firefox driver does not support:

1. **Optional chaining (`?.`)** - Modern JavaScript syntax used throughout the codebase
2. **Modern ES module features** - May have issues with ES module loading
3. **Possibly other ESNext features** - The library targets ESNext without transpilation

## Philosophy

This library prioritizes **modern JavaScript** over broad browser compatibility. Rather than adding workarounds and transpilation for older browsers, we:

- Use modern syntax (optional chaining, nullish coalescing, etc.)
- Target ESNext in TypeScript compilation
- Require browsers to support current JavaScript standards

## When to Re-enable Firefox Testing

Firefox can be re-added to the test matrix when:

1. The Playwright Firefox driver is updated to support optional chaining
2. Firefox itself adds full support for ESNext features
3. The project decides to add a transpilation step (not recommended)

## Re-enabling Firefox

To re-enable Firefox testing, uncomment the Firefox project in `playwright.config.ts`:

```typescript
{
  name: 'firefox',
  use: { ...devices['Desktop Firefox'] },
},
```

## Implementation Notes

The implementation leverages MountObserver's built-in capabilities:

- ✅ **MountObserver handles both existing and dynamic elements** - No need for manual element searching or global observer management
- ✅ **Simple per-container observers** - Each `genIds()` call creates its own MountObserver for the specified container
- ✅ **Automatic processing** - MountObserver finds elements with `-id` attribute and triggers processing for both elements already in the DOM and those added later

This approach is simpler and more reliable than maintaining global state or manually searching for elements.
