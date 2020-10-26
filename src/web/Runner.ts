import * as React from "react";

FireJSX.run = function (path = decodeURI(location.pathname)) {
    const {app, content} = FireJSX.cache[path];
    //update page if already rendered
    if (FireJSX.setApp) { // @ts-ignore
        FireJSX.setApp(app, content);
    } else {
        const func = FireJSX.isHydrated ? window.ReactDOM.hydrate : window.ReactDOM.render;
        func(React.createElement(FireJSX.app, {app, content}),
            document.getElementById("root"));
    }
    //scroll to hash
    if (location.hash) {
        const el = document.getElementById(decodeURI(location.hash.substring(1)))
        if (el)
            el.scrollIntoView()
    }
    //no more hydrated and locked
    FireJSX.isHydrated = false;
    FireJSX.linkApi.lock = false
    //after render it's no more hydrated
}
