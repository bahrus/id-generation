# id-generation

Generate id's automatically in the browser

# Auto generated id polyfill

This package provides a polyfill for [this proposal](https://github.com/whatwg/html/issues/11585), but with some differences due to the limited ability a polyfill can provide compared to the platform.

## Invoking

Any DOM fragment that gets observed by the MountObserver class instance will automatically apply  the rules discussed below.

In the absence of such observing, call:

```JavaScript
//bare import specifier to this package
import {genIds} from 'id-generation/genIds.js';
genIds(oElementContainer);
```

where oElementContainer is a Node / Element / DocumentFragment / ShadowRoot.

## Activation

To activate a scoped id generation, add attribute -id, ideally to the last streamed element inside either the fieldset element, or an element adorned by the itemscope attribute, or the (Shadow) root.  No other attribute will trigger any id substitution on that scope (starting from the closest matching ancestor of the css query "fieldset,[itemscope]" based on the ".closest()" api call built into modern browsers). 

If the element with -id attribute is not contained within a fieldset element nor an element with attribute "itemscope", then the "scope" of the id generation will be based on that passed in oElementContainer.

If the element with -id is not the last streamed element, then the functionality will likely work the same, but may possibly miss some elements after the attribute, in the unlikely event that the auto generated id's are created prior to some additional elements streaming in.  The implementation of the auto generation id's doesn't do anything special based on the placement within the fieldset element or itemscope adorned attribute.

## Example 1

```html
<fieldset disabled>
    <label>
        LHS: <input data-id={{lhs}}>
    </label>
    
    <label for=rhs>
        RHS: <input data-id={{rhs}}>
    </label>
    
    <template -id defer-🎚️ 🎚️='on if isEqual, based on #{{lhs}} and #{{rhs}}.'>
        <div>LHS === RHS</div>
    </template>
</fieldset>
<div itemscope>
    <label>
        LHS: <input data-id={{lhs}}>
    </label>

    <!-- not the last streamed child of the closest [itemscope] ancestor
     but use at your own risk, since the element below may not have streamed
     in before the id generating begins
     -->
    <template -id defer-🎚️ 🎚️='on if isEqual, based on #{{lhs}} and #{{rhs}}.'>
        <div>LHS === RHS</div>
    </template>
    
    <label for=rhs>
        RHS: <input data-id={{rhs}}>
    </label>
    

</div>
```

adjusts the DOM so as to become:

```html
<fieldset>
    <label>
        LHS: <input id=gid-0 data-id=lhs>
    </label>
    
    <label for=rhs>
        RHS: <input id=gid-1 data-id=rhs>
    </label>
    
    <template 🎚️='on if isEqual, based on #gid-0 and #gid-1.'>
        <div>LHS === RHS</div>
    </template>
</fieldset>
<div itemscope>
    <label>
        LHS: <input id=gid-2 data-id=lhs>
    </label>
    
    <!-- same comment as above remains -->
    <template 🎚️='on if isEqual, based on #gid-2 and #gid-3.'>
        <div>LHS === RHS</div>
    </template>


    <label for=rhs >
        RHS: <input id=gid-3 data-id={{rhs}}>
    </label>
</div>
```

Note that the numbers after gid- will vary depending on previous DOM elements that may have been processed by the ID generator.

To avoid collisions between different fragments, a global counter is used, which increments within a synchronous section of code as far as obtaining the next id.

Also note the use of the "disabled" attribute on the fieldset element, and the defer-🎚️ attributes, both of which get removed after the id auto generation completes.  The idea is that while the live DOM tree has these attributes, allowing user interactivity could be problematic before the id's are generated, so at a minimum, we should disable input elements, and prevent [enhancements from loading](https://github.com/WICG/webcomponents/issues/1000) until the id connection is established, scoped preferably by fieldset elements, or itemscope attributes, or the root document as a last resort.  

So the rules of handling defer-* attributes are:

1.  All than global attributes that expect id's (such as aria-labeledby, itemref, etc) will be checked for dynamic expressions like #{{lhs}}.
2.  For custom attributes that contain a - in the name, the only attributes that will be checked for dynamic substitution are attributes that have a corresponding defer- prefix, where the attribute name starts with the name that one obtains by stripping defer-

So for example:

```html
<!-- will be checked --->
 <template defer-be-switched be-switched-lhs-la-di-da=#{{lhs}}>

<!-- won't be checked / substituted because doesn't start with the defer-* attribute modulo defer- -->
 <template defer-be-switched-rhs be-switched-lhs-la-di-da=#{{lhs}}>
```

The reason why we keep the names lhs, rhs in the data-id attribute after stripping away curly braces and other side-effect inducing symbols, is that some libraries will want to refer to the name that was used to generate the id's.


## Creating id references with global or built in attributes

Again, because:

1. unlike the platform, we can't manipulate the server-streamed DOM before the browser sees it, and
2.  we don't want to "confuse" the browser by creating nonsensical id reference connections that aren't valid, even temporarily, this polyfill opts to use data-* attributes as a way of staging the dynamic attribute adjustments.  So for example:

```html
<fieldset disabled>
    <scratch-box>
        <label slot=label data-for={{createDemo}}>Create demo</label>
        <input data-id="{{@ createDemo}}" type=checkbox>
    </scratch-box>
    <scratch-box>
        <label slot=label data-for={{writeArticle}}>Write article</label>
        <input data-id="{{@ writeArticle}}" type=checkbox>
    </scratch-box>
    <scratch-box>
        <label slot=label data-for={{exercise}}>Exercise</label>
        <input -id data-id="{{@ exercise}}" type=checkbox>
    </scratch-box>
</fieldset>
```

becomes

```html
<fieldset disabled>
    <scratch-box enh-be-importing=scratch-box/root.mjs>
        <label slot=label for=gid-0>Create demo</label>
        <input id=gid-0 name=createDemo data-id=createDemo type=checkbox>
    </scratch-box>
    <scratch-box>
        <label slot=label for=gid-1>Write article</label>
        <input id=gid-1 name=writeArticle data-id=writeArticle type=checkbox>
    </scratch-box>
    <scratch-box>
        <label slot=label for=gid-2>Exercise</label>
        <input id=gid-2 name=exercise data-id=exercise type=checkbox>
    </scratch-box>
</fieldset>
```

It is often the case that the name we want to use to auto generate the unique id's will match the "name" attribute we want to assign the element, and/or the itemprop and/or the class and/or the part.  This can be done in a few ways.

## Side Effects from dynamic data-id attribute

```html
<form>
    <fieldset disabled>
        <label>
            LHS: <input class=my-class data-id="{{@. lhs}}">
        </label>
        
        <label for=rhs>
            RHS: <span contenteditable part=my-part data-id="{{|.% rhs}}">
        </label>
        
        <template -id defer-🎚️ 🎚️='on if isEqual, based on #{{lhs}} and #{{rhs}}.'>
            <div>LHS === RHS</div>
        </template>
    </fieldset>
</form>
```

results in

```html
<form>
    <fieldset>
        <label>
            LHS: <input name=lhs itemprop=lhs class="my-part lhs" id=gid-0  data-id=lhs>
        </label>
        
        <label for=rhs>
            RHS: <span contenteditable itemprop=rhs part="my-part rhs" id=gid-1 data-id=rhs>
        </label>
        
        <template 🎚️='on if isEqual, based on #gid-0 and #gid-1.'>
            <div>LHS === RHS</div>
        </template>
    </fieldset>
</form>
```

So we are using some special symbols to correspond with key attributes:

 Symbol | Translates to         | Connection / meaning                                                                                                                             |
|--------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| #      | id                    | # used by css for id, also bookmarks in urls that points to id's                                                                                 |
| \|     | itemprop              | "Pipe" is kind of close to itemprop, and is half of a dollar sign, and it kind of looks like an I                                                |
| @      | name                  | Second letter of name. Also, common in social media sites/github to type this letter in order to select someone's name.                          |
| $      | itemscope + itemprop  | Combination of S for Scope and Pipe which resembles itemprop a bit                                                                               |
| %      | part                  | Starts with p, percent is used for indicating what proportion something is.                                                                      |
| .      | class                 | css selector                                                                                                                                     |

These match the symbols used in the [template instantiation productivity proposal](https://github.com/WICG/webcomponents/issues/1013#issuecomment-2257557589).

Multiple symbols can be specified, as shown in the example above, resulting in multiple attribute additions.

So for example:

```html
<span contenteditable part=my-part data-id="{{|.% rhs}}">
```

means "add attributes itemprop=rhs, class=rhs and part=rhs"

The examples that follow go in the opposite direction -- we "infer" the id generating name based on either the name of the element, or one of the key attributes.

When we dynamically add the class or part attribute, it will add to any existing class or part attributes, rather than replacing the entire attribute.  All of these symbols are entirely optional, and will only result in the value between added to the targeted attribute if present. 

## By tag name

Id's based on the element name are generated when the literal attribute "#" is found adorning the element.

```html
<ways-of-science itemscope>
    <carrot-nosed-woman #></carrot-nosed-woman>
    <a-duck #></a-duck>
    <template -id defer-🎚️
        🎚️="on based on #{{carrot-nosed-woman}}::weight-change and #{{a-duck}}::molting."
        onchange="event.r = Math.abs(event.args[0] - event.args[1]) < 10"
    >
        <div>A witch!</div>
        <div>Burn her!</div>
    </template>
</ways-of-science>
```

results in:

```html
<ways-of-science itemscope>
    <carrot-nosed-woman id=gid-0 data-id=carrot-nosed-woman></carrot-nosed-woman>
    <a-duck id=gid-1 data-id=a-duck></a-duck>
    <template
        🎚️="on based on #gid-0::weight-change and #gid-1::molting."
        onchange="event.r = Math.abs(event.args[0] - event.args[1]) < 10"
    >
        <div>A witch!</div>
        <div>Burn her!</div>
    </template>
</ways-of-science>
```

## By N@me

```html
<form>
    <fieldset disabled>
        <input name=isHappy type="checkbox" @>
        <template -id defer-🎚️ 🎚️='on when #{{isHappy}}.'>
            <my-content></my-content>
        </template>
    </fieldset>
</form>
```

results in:

```html
<form>
    <fieldset>
        <input name=isHappy id=gid-0 data-id=isHappy type="checkbox">
        <template 🎚️='on when #gid-0.'>
            <my-content></my-content>
        </template>
    </fieldset>
</form>
```

## By |temprop

```html
<form>
    <fieldset disabled>
        <data value=true itemprop=isHappy hidden |></data>
        <template -id defer-🎚️ 🎚️='on when #{{isHappy}}.'>
            <my-content></my-content>
        </template>
    </fieldset>
</form>
```

results in:

```html
<form>
    <fieldset>
        <data value=true data-id=isHappy id=gid-0 itemprop=isHappy hidden></data>
        <template 🎚️='on when #gid-0.'>
            <my-content></my-content>
        </template>
    </fieldset>
</form>
```

## Implementation notes

This package utilizes the [following package](https://github.com/bahrus/mount-observer/tree/v2) to watch for DOM mutations, watching in particular for elements with attribute "-id":


```JavaScript
const observer = new MountObserver({
   whereElementMatches:'-id',
   do: ({localName}, {modules, observer, observeInfo}) => {
      //generate the id's for the scoped ancestor
   }
   
}, {disconnectedSignal: new AbortController().signal});
observer.observe(document);
```

In the scenario where side effects are specified, such as 

```html
<input datai-id="{{@ myName}}">
```

the name value "myName" is obtained by extracting the string between the last space and the last "}}".

If a DOM element already has a non-empty string id, then this package will *not* change it, and will console.error information about the element.

No forward referencing will take place, putting the onus on the developer using this library to carefully place the -id attribute in such a location so that no forward referencing should be required.

The defer-* and disabled attributes are only removed after all processing for the scoped DOM element has finished.


