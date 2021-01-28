import Link from "firejsx/Link";
import Head from "firejsx/Head";
import LazyLoad from "firejsx/LazyLoad";


export default () => {
    // @ts-ignore
    const Markdown = LazyLoad(() => import("../../components/Markdown/Markdown.jsx"), () => require.resolveWeak("../../components/Markdown/Markdown.jsx"))

    return (
        <div>
            <Head>
                <title>About</title>
            </Head>
            <Markdown>
                By the way, I am a lazy loaded component 😺
            </Markdown>
            <h1>This is the about pages</h1>
            <br/>
            <Link href={"/"}> 👻 Click Here To Go Home. Ha ha </Link>
        </div>
    )
}
