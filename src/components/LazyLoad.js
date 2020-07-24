export default (loadFunc,
                resolveID, {
                    placeHolder = <div suppressHydrationWarning={true}/>,
                    onError = (e) => {
                        console.error("Error while lazy loading ");
                        throw new Error(e);
                    }
                } = {}) => {
    let props;
    let setChild;

    if (FireJSX.isSSR && resolveID)
        return __webpack_require__(resolveID()).default
    else
        loadFunc().then(chunk => {
            setChild(React.createElement(chunk.default, {
                ...props,
                suppressHydrationWarning: true
            }, props.children))
        }).catch(onError)

    return (_props) => {
        const [child, _setChild] = React.useState(placeHolder);
        setChild = _setChild;
        props = _props;
        return child
    }
}