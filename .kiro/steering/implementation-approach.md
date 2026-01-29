---
inclusion: always
---

# ID Generation Implementation Approach

## Core Design Principle

**Leverage MountObserver's built-in capabilities** rather than reimplementing element discovery and observation logic.

## How genIds() Works

```typescript
export function genIds(container: Node, options?: GenIdsOptions): void {
    const mo = new MountObserver({
        whereElementMatches: '[\\-id]',
        do: (element: Element) => {
            processScope(element, container);
        }
    });
    mo.observe(container);
}
```

### Key Points

1. **Each call creates a new observer** - No global state management needed
2. **MountObserver handles everything** - It automatically:
   - Finds existing elements with `-id` in the container
   - Watches for dynamically added elements with `-id`
   - Triggers the callback for both cases
3. **Simple and reliable** - No manual element searching, no global observer coordination

## Why This Approach

### What We Avoided

The initial implementation attempted to:
- Maintain a global MountObserver instance
- Manually search for existing elements with `querySelectorAll('*')`
- Coordinate between multiple `genIds()` calls
- Handle edge cases around multiple module versions

### What We Gained

By trusting MountObserver to do its job:
- **Simpler code** - ~10 lines instead of ~50
- **No global state** - Each container gets its own observer
- **No manual searching** - MountObserver finds both existing and future elements
- **Better separation of concerns** - MountObserver handles observation, genIds handles processing

## Global Counter

The only global state is the ID counter, stored on `globalThis` via `Symbol.for()`:

```typescript
const COUNTER_KEY = Symbol.for('IZiYU8ZlkUGAeDxOl3S8AQ');
```

This ensures:
- Unique IDs across all instances
- Works even with multiple module versions
- No ID collisions

## Lesson Learned

**Don't reinvent what your dependencies already do well.** MountObserver was designed to handle element observation - both existing and dynamic. Trust it to do that job rather than building workarounds.
