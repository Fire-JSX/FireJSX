import {join} from "path"
import Page from "../classes/Page";

export interface Externals {
    app: string[]
    full: string
    semi: string
}

export interface StaticConfig {
    lib: string,
    outDir: string,
    externals: Externals,
    ssr: boolean,
    prefix: string,
    staticPrefix: string,
    fullExternalPath: string,
}

{
    // @ts-ignore
    global.self = global;
    // @ts-ignore
    const ssr_window = require("ssr-window").window;

    for (const prop in ["document", "navigator", "history"])
        global[prop] = ssr_window[prop]

    global.location = {
        ancestorOrigins: undefined,
        assign(url: string): void {
            const parsed_url = new URL(url);
            this.hash = parsed_url.hash;
            this.host = parsed_url.host;
            this.hostname = parsed_url.hostname;
            this.href = parsed_url.href;
            this.origin = parsed_url.origin;
            this.pathname = parsed_url.pathname;
            this.port = parsed_url.port;
            this.protocol = parsed_url.protocol;
            this.search = parsed_url.search;
        },
        hash: "",
        host: "",
        hostname: "",
        href: "",
        origin: "",
        pathname: "",
        port: "",
        protocol: "",
        replace(url: string): void {
            this.assign(url)
        },
        search: "",
        toString(): string {
            return "";
        },
        reload(forcedReload?: boolean): void {
        }
    }
    location.assign("https://firejsx.com")
}

export default class {
    config: StaticConfig

    constructor(param: StaticConfig) {
        this.config = param;
        FireJSX.lib = this.config.lib;
        FireJSX.isSSR = this.config.ssr;
        FireJSX.staticPrefix = this.config.staticPrefix;
        FireJSX.prefix = this.config.prefix;
        if (param.ssr)
            require(param.fullExternalPath)
        //require app here
    }

    render(page: Page, path: string, content: any): string {
        //globals
        location.assign("https://firejsx.com" + path);

        let mapCache = FireJSX.cache[path];
        if (!mapCache)
            mapCache = (FireJSX.cache[path] = {})
        mapCache.content = content;
        mapCache.chunks = page.chunks;
        //if ssr then require async chunks
        if (this.config.ssr)
            page.chunks.async.forEach(chunk => {
                if (chunk.endsWith(".js"))
                    require(`${this.config.outDir}/${this.config.lib}/${chunk}`)
            })
        let head, body;
        //map
        {
            const li = path.lastIndexOf("/index")
            const mapPath = `${this.config.prefix}/${this.config.lib}/map${li <= 0 ? path : path.substring(0, li)}.map.js`
            head = `<link href="${mapPath}" as="script" rel="preload" crossorigin="anonymous"/>`
            body = `<script src="${mapPath}" crossorigin="anonymous"></script>`
        }
        //external mini
        {
            const arr = this.loadChunks(head, body, [this.config.externals.semi], false)
            head = arr[0]
            body = arr[1]
        }
        //App
        {
            const arr = this.loadChunks(head, body, this.config.externals.app, false)
            head = arr[0]
            body = arr[1]
        }
        //entry chunks
        {
            const arr = this.loadChunks(head, body, page.chunks.entry)
            head = arr[0]
            body = arr[1]
        }
        //initial chunks
        {
            const arr = this.loadChunks(head, body, page.chunks.initial)
            head = arr[0]
            body = arr[1]
        }
        //render
        const rootDiv = this.config.ssr ? global.ReactDOMServer.renderToString(
            global.React.createElement(FireJSX.app, {app: mapCache.app, content})
        ) : ""
        //helmet
        if (this.config.ssr) {
            const helmet = global.__FIREJSX_HELMET__.renderStatic();
            for (let helmetKey in helmet)
                head = helmet[helmetKey].toString() + head
        }
        //concat every thing
        return "<!doctype html>" +
            "<html lang=\"en\"><head>" +
            "<meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            `<meta name="generator" content="FireJSX v${FireJSX.version}"/>` +
            `<script>window.FireJSX={cache:{},` +
            `isHydrated: ${this.config.ssr},` +
            `lib: "${this.config.lib}",` +
            `prefix: "${this.config.prefix}",` +
            `staticPrefix: "${this.config.staticPrefix}",` +
            `version: "${FireJSX.version}"}</script>` +
            head +
            "</head><body><div id=\"root\">" +
            rootDiv +
            "</div>" +
            body +
            "</body></html>"
    }

    private loadChunks(head: string, body: string, chunks: string[], _require = true): [string, string] {
        chunks.forEach(chunk => {
            const src = `${this.config.prefix}/${this.config.lib}/${chunk}`
            if (chunk.endsWith(".js")) {
                if (this.config.ssr && _require)
                    require(join(this.config.outDir, this.config.lib, chunk))
                head += `<link rel="preload" href="${src}" as="script" crossorigin="anonymous"/>`
                body += `<script src="${src}" crossorigin="anonymous"></script>`
            } else if (chunk.endsWith(".css"))
                head = `<link rel="stylesheet" href="${src}" crossorigin="anonymous"/>` + head
            else
                body += `<link href="${src}" crossorigin="anonymous"/>`
        })
        return [head, body]
    }
}
