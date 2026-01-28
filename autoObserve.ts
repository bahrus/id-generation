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

    
    return observer;
}
