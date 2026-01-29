// Type definitions for id-generation

export interface GenIdsOptions {
    //startCounter?: number;
}

export interface ParsedDataId {
    name: string;
    setName: boolean;
    setItemprop: boolean;
    setClass: boolean;
    setPart: boolean;
    setItemscope: boolean;
}

export interface ScopeInfo {
    scopeElement: Element;
    elementsToProcess: Element[];
}

export interface AttributeReplacement {
    element: Element;
    attributeName: string;
    oldValue: string;
    newValue: string;
}
