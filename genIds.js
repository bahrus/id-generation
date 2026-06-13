// Use a truly global counter via Symbol.for to handle multiple module versions
const COUNTER_KEY = Symbol.for('IZiYU8ZlkUGAeDxOl3S8AQ');
// Initialize global counter if it doesn't exist
if (typeof globalThis[COUNTER_KEY] !== 'number') {
    globalThis[COUNTER_KEY] = 0;
}
/**
 * Process a scope starting from the trigger element
 * @param trigger - Element with -id attribute that triggers processing
 * @param fallbackContainer - Fallback container if no scope element is found
 */
export function genIds(trigger, fallbackContainer) {
    // Find the scope element using .closest() with the following priority:
    // 1. [id-scope] - explicit developer-defined scope boundary
    // 2. fieldset, [itemscope] - semantic HTML containers
    // 3. fallbackContainer - the root node passed in by the developer
    const scopeElement = trigger.closest('[id-scope],fieldset,[itemscope]') ||
        (fallbackContainer instanceof Element ? fallbackContainer :
            fallbackContainer instanceof Document ? fallbackContainer.documentElement :
                null);
    if (!scopeElement) {
        console.warn('No scope element found for trigger', trigger);
        return;
    }
    // Collect all elements that need ID generation
    const elementsToProcess = collectElementsForIdGeneration(scopeElement);
    // Map to track name -> generated ID
    const nameToIdMap = new Map();
    // First pass: generate IDs for elements
    for (const element of elementsToProcess) {
        processElementForId(element, nameToIdMap);
    }
    // Second pass: replace references in attributes
    const replacements = collectAttributeReplacements(scopeElement, nameToIdMap);
    applyAttributeReplacements(replacements);
    // Remove -id attribute from trigger
    trigger.removeAttribute('-id');
    // Remove defer-* attributes and disabled from fieldset
    removeDeferAttributes(scopeElement);
    if (scopeElement.tagName === 'FIELDSET') {
        scopeElement.removeAttribute('disabled');
    }
}
/**
 * Collect all elements that need ID generation within the scope
 */
function collectElementsForIdGeneration(scope) {
    const elements = [];
    // Firefox has issues with TreeWalker acceptNode objects
    // Use querySelectorAll with manual filtering instead
    const allElements = scope.querySelectorAll('*');
    for (const element of allElements) {
        // Check for data-id attribute
        if (element.hasAttribute('data-id')) {
            elements.push(element);
            continue;
        }
        // Check for shorthand attributes: #, @, |
        if (element.hasAttribute('#') || element.hasAttribute('@') || element.hasAttribute('|')) {
            elements.push(element);
        }
    }
    return elements;
}
/**
 * Process an element to generate its ID
 */
function processElementForId(element, nameToIdMap) {
    // Skip if element already has an ID
    if (element.id) {
        console.error('Element already has an ID, skipping:', element);
        return;
    }
    let name = null;
    let parsed = null;
    // Check for data-id attribute
    if (element.hasAttribute('data-id')) {
        const dataIdValue = element.getAttribute('data-id');
        parsed = parseDataId(dataIdValue);
        name = parsed.name;
    }
    // Check for # attribute (use tag name)
    else if (element.hasAttribute('#')) {
        name = element.localName;
        element.removeAttribute('#');
    }
    // Check for @ attribute (use name attribute)
    else if (element.hasAttribute('@')) {
        name = element.getAttribute('name');
        element.removeAttribute('@');
    }
    // Check for | attribute (use itemprop attribute)
    else if (element.hasAttribute('|')) {
        name = element.getAttribute('itemprop');
        element.removeAttribute('|');
    }
    if (!name) {
        console.warn('Could not determine name for element:', element);
        return;
    }
    // Generate ID using the global counter
    const generatedId = `gid-${globalThis[COUNTER_KEY]++}`;
    element.id = generatedId;
    // Store mapping
    nameToIdMap.set(name, generatedId);
    // Update data-id to clean name
    element.setAttribute('data-id', name);
    // Apply side effects if parsed
    if (parsed) {
        applySideEffects(element, parsed);
    }
}
/**
 * Parse data-id attribute value
 */
function parseDataId(value) {
    // Remove {{ and }} if present
    let cleaned = value.replace(/^\{\{/, '').replace(/\}\}$/, '');
    // Check for symbols
    const setName = cleaned.includes('@');
    const setItemprop = cleaned.includes('|');
    const setClass = cleaned.includes('.');
    const setPart = cleaned.includes('%');
    const setItemscope = cleaned.includes('$');
    // Extract name: everything after the last space before the last }}
    const lastSpaceIndex = cleaned.lastIndexOf(' ');
    const name = lastSpaceIndex >= 0 ? cleaned.substring(lastSpaceIndex + 1).trim() : cleaned.trim();
    // Remove symbols from name
    const cleanName = name.replace(/[@|.%$#]/g, '');
    return {
        name: cleanName,
        setName,
        setItemprop,
        setClass,
        setPart,
        setItemscope
    };
}
/**
 * Apply side effects based on parsed data-id
 */
function applySideEffects(element, parsed) {
    if (parsed.setName) {
        element.setAttribute('name', parsed.name);
    }
    if (parsed.setItemprop) {
        element.setAttribute('itemprop', parsed.name);
    }
    if (parsed.setItemscope) {
        element.setAttribute('itemscope', '');
        element.setAttribute('itemprop', parsed.name);
    }
    if (parsed.setClass) {
        const existingClass = element.getAttribute('class');
        if (existingClass) {
            element.setAttribute('class', `${existingClass} ${parsed.name}`);
        }
        else {
            element.setAttribute('class', parsed.name);
        }
    }
    if (parsed.setPart) {
        const existingPart = element.getAttribute('part');
        if (existingPart) {
            element.setAttribute('part', `${existingPart} ${parsed.name}`);
        }
        else {
            element.setAttribute('part', parsed.name);
        }
    }
}
/**
 * Collect all attribute replacements needed
 */
function collectAttributeReplacements(scope, nameToIdMap) {
    const replacements = [];
    // Process the scope element itself
    processElementAttributes(scope, nameToIdMap, replacements);
    // Process all descendants
    const allElements = scope.querySelectorAll('*');
    for (const element of allElements) {
        processElementAttributes(element, nameToIdMap, replacements);
    }
    return replacements;
}
/**
 * Process attributes of an element for replacements
 */
function processElementAttributes(element, nameToIdMap, replacements) {
    const attributes = Array.from(element.attributes);
    const deferredAttributes = new Set();
    // First pass: collect all defer-* attributes
    for (const attr of attributes) {
        if (attr.name.startsWith('defer-')) {
            const baseAttrName = attr.name.substring(6); // Remove 'defer-'
            deferredAttributes.add(baseAttrName);
        }
    }
    for (const attr of attributes) {
        const attrName = attr.name;
        const attrValue = attr.value;
        // Skip defer-* attributes themselves
        if (attrName.startsWith('defer-')) {
            continue;
        }
        // Check if this is a global attribute that expects IDs
        const isGlobalIdAttribute = isGlobalAttributeWithIdReferences(attrName);
        // Check if this is a data-* attribute
        const isDataAttribute = attrName.startsWith('data-');
        // Check if this attribute has a defer- prefix
        const hasDefer = deferredAttributes.has(attrName);
        let shouldProcess = false;
        if (isGlobalIdAttribute) {
            shouldProcess = true;
        }
        else if (isDataAttribute) {
            shouldProcess = true;
        }
        else if (hasDefer) {
            // Any attribute with a defer- prefix should be processed
            shouldProcess = true;
        }
        if (shouldProcess && attrValue.includes('#{{')) {
            const newValue = replaceIdReferences(attrValue, nameToIdMap);
            if (newValue !== attrValue) {
                replacements.push({
                    element,
                    attributeName: attrName,
                    oldValue: attrValue,
                    newValue
                });
            }
        }
    }
}
/**
 * Check if an attribute is a global attribute that expects ID references
 */
function isGlobalAttributeWithIdReferences(attrName) {
    const globalIdAttributes = [
        'aria-labelledby',
        'aria-describedby',
        'aria-controls',
        'aria-owns',
        'aria-flowto',
        'aria-activedescendant',
        'for',
        'form',
        'list',
        'itemref'
    ];
    return globalIdAttributes.includes(attrName) || attrName.startsWith('data-');
}
/**
 * Replace #{{name}} references with generated IDs
 */
function replaceIdReferences(value, nameToIdMap) {
    return value.replace(/#\{\{([^}]+)\}\}/g, (match, name) => {
        const trimmedName = name.trim();
        const generatedId = nameToIdMap.get(trimmedName);
        if (generatedId) {
            return `#${generatedId}`;
        }
        console.warn(`No ID found for reference: ${trimmedName}`);
        return match;
    });
}
/**
 * Apply all attribute replacements
 */
function applyAttributeReplacements(replacements) {
    for (const replacement of replacements) {
        replacement.element.setAttribute(replacement.attributeName, replacement.newValue);
    }
}
/**
 * Remove all defer-* attributes from elements in scope
 */
function removeDeferAttributes(scope) {
    // Process the scope element itself
    const attributesToRemove = [];
    for (const attr of Array.from(scope.attributes)) {
        if (attr.name.startsWith('defer-')) {
            attributesToRemove.push(attr.name);
        }
    }
    for (const attrName of attributesToRemove) {
        scope.removeAttribute(attrName);
    }
    // Process all descendants
    const allElements = scope.querySelectorAll('*');
    for (const element of allElements) {
        const attrsToRemove = [];
        for (const attr of Array.from(element.attributes)) {
            if (attr.name.startsWith('defer-')) {
                attrsToRemove.push(attr.name);
            }
        }
        for (const attrName of attrsToRemove) {
            element.removeAttribute(attrName);
        }
    }
}
