/**
 * Adapted from `material-light`
 * Ref: https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/b2457268891948f7005ccf539a70c000f0695bde/src/styles/prism/material-light.js#L1
 *
 * This theme overwrites colors to be similiar to the `@databricks/editor` theme.
 * Since it is only used for `sql`, in only changes colors for code parts defined in `../lang/sql.ts` (see lines with `// D`)
 */
declare const databricksLightTheme: {
    'code[class*="language-"]': {
        textAlign: string;
        whiteSpace: string;
        wordSpacing: string;
        wordBreak: string;
        wordWrap: string;
        color: string;
        background: string;
        fontFamily: string;
        fontSize: string;
        lineHeight: string;
        MozTabSize: string;
        OTabSize: string;
        tabSize: string;
        WebkitHyphens: string;
        MozHyphens: string;
        msHyphens: string;
        hyphens: string;
    };
    'pre[class*="language-"]': {
        textAlign: string;
        whiteSpace: string;
        wordSpacing: string;
        wordBreak: string;
        wordWrap: string;
        color: string;
        background: string;
        fontFamily: string;
        fontSize: string;
        lineHeight: string;
        MozTabSize: string;
        OTabSize: string;
        tabSize: string;
        WebkitHyphens: string;
        MozHyphens: string;
        msHyphens: string;
        hyphens: string;
        overflow: string;
        position: string;
        margin: string;
        padding: string;
    };
    'code[class*="language-"]::-moz-selection': {
        background: string;
        color: string;
    };
    'pre[class*="language-"]::-moz-selection': {
        background: string;
        color: string;
    };
    'code[class*="language-"] ::-moz-selection': {
        background: string;
        color: string;
    };
    'pre[class*="language-"] ::-moz-selection': {
        background: string;
        color: string;
    };
    'code[class*="language-"]::selection': {
        background: string;
        color: string;
    };
    'pre[class*="language-"]::selection': {
        background: string;
        color: string;
    };
    'code[class*="language-"] ::selection': {
        background: string;
        color: string;
    };
    'pre[class*="language-"] ::selection': {
        background: string;
        color: string;
    };
    ':not(pre) > code[class*="language-"]': {
        whiteSpace: string;
        borderRadius: string;
        padding: string;
    };
    '.language-css > code': {
        color: string;
    };
    '.language-sass > code': {
        color: string;
    };
    '.language-scss > code': {
        color: string;
    };
    '[class*="language-"] .namespace': {
        Opacity: string;
    };
    atrule: {
        color: string;
    };
    'attr-name': {
        color: string;
    };
    'attr-value': {
        color: string;
    };
    attribute: {
        color: string;
    };
    boolean: {
        color: string;
    };
    builtin: {
        color: string;
    };
    cdata: {
        color: string;
    };
    char: {
        color: string;
    };
    class: {
        color: string;
    };
    'class-name': {
        color: string;
    };
    comment: {
        color: string;
    };
    constant: {
        color: string;
    };
    deleted: {
        color: string;
    };
    doctype: {
        color: string;
    };
    entity: {
        color: string;
    };
    function: {
        color: string;
    };
    hexcode: {
        color: string;
    };
    id: {
        color: string;
        fontWeight: string;
    };
    important: {
        color: string;
        fontWeight: string;
    };
    inserted: {
        color: string;
    };
    keyword: {
        color: string;
    };
    number: {
        color: string;
    };
    operator: {
        color: string;
    };
    prolog: {
        color: string;
    };
    property: {
        color: string;
    };
    'pseudo-class': {
        color: string;
    };
    'pseudo-element': {
        color: string;
    };
    punctuation: {
        color: string;
    };
    regex: {
        color: string;
    };
    selector: {
        color: string;
    };
    string: {
        color: string;
    };
    symbol: {
        color: string;
    };
    tag: {
        color: string;
    };
    unit: {
        color: string;
    };
    url: {
        color: string;
    };
    variable: {
        color: string;
    };
};
export default databricksLightTheme;
//# sourceMappingURL=databricks-light.d.ts.map