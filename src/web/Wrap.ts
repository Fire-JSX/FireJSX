export default function (app, hot) {
    const path = FireJSX.isSSR ? location.pathname : (() => {
        let path = decodeURI(location.pathname);
        const li = path.lastIndexOf("/index")
        if (path.endsWith("/index"))
            path = li <= 0 ? "/" : path.substring(0, li);
        path = path.replace(FireJSX.prefix, "");
        if (!FireJSX.cache[path])
            path = "/404";
        return path;
    })();
    FireJSX.cache[path].app = hot ? hot(app) : app;
    if (!FireJSX.isSSR)
        FireJSX.run(path);
}
