import { MountObserver } from 'mount-observer/MountObserver.js';
import { genIds } from './genIds.js';

/**
 * Automatically observe the document for elements with -id attribute
 * and generate IDs when they are mounted
 */
export function autoObserve(rootNode: Node = document, signal?: AbortSignal): MountObserver {
    const observer = new MountObserver({
        whereElementMatches: '[\\-id]',
        do: (element: Element) => {
            // Find the scope for this trigger element
            const scope = element.closest('fieldset,[itemscope]') || rootNode;
            
            if (scope instanceof Element || scope instanceof DocumentFragment || 
                (typeof ShadowRoot !== 'undefined' && scope instanceof ShadowRoot)) {
                genIds(scope);
            }
        }
    });
    
    observer.observe(rootNode);
    
    // Also process any existing elements with -id that are already in the DOM
    if ('querySelectorAll' in rootNode && typeof (rootNode as any).querySelectorAll === 'function') {
        const allElements = (rootNode as ParentNode).querySelectorAll('*');
        for (const element of allElements) {
            if (element.hasAttribute('-id')) {
                const scope = element.closest('fieldset,[itemscope]') || rootNode;
                if (scope instanceof Element || scope instanceof DocumentFragment || 
                    (typeof ShadowRoot !== 'undefined' && scope instanceof ShadowRoot)) {
                    genIds(scope);
                }
            }
        }
    }
    
    return observer;
}
