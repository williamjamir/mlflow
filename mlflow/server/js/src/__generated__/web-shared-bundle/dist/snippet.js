import _pick from 'lodash/pick';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { PrismLight } from 'react-syntax-highlighter';
import { css } from '@emotion/react';
import { jsx, jsxs, Fragment } from '@emotion/react/jsx-runtime';
import { useDesignSystemTheme, Tooltip, Button, CheckIcon, CopyIcon, FullscreenExitIcon, FullscreenIcon } from '@databricks/design-system';
import { useClipboard } from 'use-clipboard-copy';
import { FormattedMessage } from '@databricks/i18n';

function _EMOTION_STRINGIFIED_CSS_ERROR__$1() { return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop)."; }
const actionContainerStyle = process.env.NODE_ENV === "production" ? {
  name: "1p8ro9d",
  styles: "margin-right:16px;text-align:right;position:absolute;right:0;padding-top:2px"
} : {
  name: "ie5rkd-actionContainerStyle",
  styles: "margin-right:16px;text-align:right;position:absolute;right:0;padding-top:2px;label:actionContainerStyle;",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__$1
};
function SnippetActionsContainer(_ref) {
  let {
    children
  } = _ref;
  return jsx("div", {
    css: actionContainerStyle,
    children: children
  });
}

const SnippetActionsThemeContext = /*#__PURE__*/React.createContext({});
function SnippetActionsThemeProvider(_ref) {
  let {
    children,
    theme = {}
  } = _ref;
  return jsx(SnippetActionsThemeContext.Provider, {
    value: theme,
    children: children
  });
}
function useSnippetActionsTheme() {
  return useContext(SnippetActionsThemeContext);
}

// Adapted from `refractor`: https://github.com/wooorm/refractor/blob/2f8753099d399946e1c61e9c8338a5fc2bc5908d/lang/sql.js#L6
// which is used by `react-syntax-highlighter`'s `PrismLight`
function sql(Prism) {
  Prism.languages.sql = {
    comment: {
      pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/,
      lookbehind: true
    },
    variable: [{
      pattern: /@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/,
      greedy: true
    }, /@[\w.$]+/],
    string: {
      pattern: /(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\]|\2\2)*\2/,
      greedy: true,
      lookbehind: true
    },
    identifier: {
      pattern: /(^|[^@\\])`(?:\\[\s\S]|[^`\\]|``)*`/,
      greedy: true,
      lookbehind: true,
      inside: {
        punctuation: /^`|`$/
      }
    },
    // TODO(harun): unify client-side databricks syntax definition duplicated across sql highlighters, sql editors as well as sql-autocomplete
    // Custom Databricks functions are from the start until `AVG` (excl).
    function: /\b(?:BASE64|PARSE_URL|UPPER|LOWER|INITCAP|FORMAT_NUMBER|FORMAT_STRING|TRIM|UNBASE64|CONCAT|MAP|MAP_KEYS|MAP_VALUES|MAP_ENTRIES|MAP_FILTER|MAP_FROM_ARRAYS|MAP_FROM_ENTRIES|MAP_ZIP_WITH|ARRAY|AVG|COUNT|FIRST|FORMAT|LAST|LCASE|LEN|MAX|MID|MIN|MOD|NOW|ROUND|SUM|UCASE)(?=\s*\()/i,
    // Custom Databricks keywords are from the start until `ACTION` (excl).
    // Last keywords starting from `AND` (incl.) are moved from the "operators" because `@databricks/editor` considers these as "keywords"
    keyword: /\b(?:COPY|DESCRIBE HISTORY|DESCRIBE DETAIL|STORAGE CREDENTIALS?|URL|CACHE|UNCACHE|VACUUM|MSCK|CATALOGS?|CREDENTIALS?|FILES?|RECIPIENTS?|PROVIDERS?|TBLPROPERTIES|SHARES|VIEWS|EXTERNAL|REPAIR|REFRESH|COMMENT|LIST|PARQUET|LOCATIONS?|OPTIONS|JAR|ARCHIVE|ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR(?:ACTER|SET)?|CHECK(?:POINT)?|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMNS?|COMMENT|COMMIT(?:TED)?|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS(?:TABLE)?|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|CYCLE|DATA(?:BASES?)?|DATE(?:TIME)?|DAY|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITERS?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE|ELSE(?:IF)?|ENABLE|ENCLOSED|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPED?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|HOUR|IDENTITY(?:COL|_INSERT)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|INVOKER|ISOLATION|ITERATE|JOIN|KEYS?|KILL|LANGUAGE|LAST|LEAVE|LEFT|LEVEL|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|LOOP|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MINUTE|MODE|MODIFIES|MODIFY|MONTH|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL|NATURAL|NCHAR|NEXT|NO|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREPARE|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READS?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEAT(?:ABLE)?|REPLACE|REPLICATION|REQUIRE|RESIGNAL|RESTORE|RESTRICT|RETURN(?:ING|S)?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SECOND|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|SQL|START(?:ING)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED|TEXT(?:SIZE)?|THEN|TIME(?:STAMP)?|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNLOCK|UNPIVOT|UNSIGNED|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?|YEAR|AND|BETWEEN|DIV|ILIKE|IN|IS|LIKE|NOT|OR|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,
    boolean: /\b(?:FALSE|NULL|TRUE)\b/i,
    number: /\b0x[\da-f]+\b|\b\d+(?:\.\d*)?|\B\.\d+\b/i,
    operator: // This is taken from `refractor`
    // eslint-disable-next-line no-useless-escape
    /[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/i,
    punctuation: /[;[\]()`,.]/
  };
}

sql.displayName = 'databricks-runtime-sql';
sql.aliases = ['sql', 'dbr-sql', 'dbsql', 'databricks-sql'];

// TODO(dubois): remove dark theme colors once dubois dark theme styles are imported
const buttonBackgroundColorDark = 'rgba(140, 203, 255, 0)';
const buttonColorDark = 'rgba(255, 255, 255, 0.84)';
const buttonHoverColorDark = '#8ccbffcc';
const buttonHoverBackgroundColorDark = 'rgba(140, 203, 255, 0.08)'; // TODO(dubois): import this from dubois theme when it is exposed

const duboisAlertBackgroundColor = '#fff0f0';
const snippetPadding = '24px';

/**
 * Adapted from `duotone-dark`
 * Ref: https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/b2457268891948f7005ccf539a70c000f0695bde/src/styles/prism/duotone-dark.js
 *
 * Since it is only used for `sql`, in only changes colors for code parts defined in `../lang/sql.ts` (see lines with `// D`)
 */
const databricksDuotoneDarkTheme = {
  'code[class*="language-"]': {
    fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace',
    fontSize: '14px',
    lineHeight: '1.375',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
    background: '#2a2734',
    color: '#5DFAFC' // D

  },
  'pre[class*="language-"]': {
    fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace',
    fontSize: '14px',
    lineHeight: '1.375',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
    background: '#2a2734',
    color: '#5DFAFC',
    // D
    padding: '1em',
    margin: '.5em 0',
    overflow: 'auto'
  },
  'pre > code[class*="language-"]': {
    fontSize: '1em'
  },
  'pre[class*="language-"]::-moz-selection': {
    textShadow: 'none',
    background: '#6a51e6'
  },
  'pre[class*="language-"] ::-moz-selection': {
    textShadow: 'none',
    background: '#6a51e6'
  },
  'code[class*="language-"]::-moz-selection': {
    textShadow: 'none',
    background: '#6a51e6'
  },
  'code[class*="language-"] ::-moz-selection': {
    textShadow: 'none',
    background: '#6a51e6'
  },
  'pre[class*="language-"]::selection': {
    textShadow: 'none',
    background: '#6a51e6'
  },
  'pre[class*="language-"] ::selection': {
    textShadow: 'none',
    background: '#6a51e6'
  },
  'code[class*="language-"]::selection': {
    textShadow: 'none',
    background: '#6a51e6'
  },
  'code[class*="language-"] ::selection': {
    textShadow: 'none',
    background: '#6a51e6'
  },
  ':not(pre) > code[class*="language-"]': {
    padding: '.1em',
    borderRadius: '.3em'
  },
  comment: {
    color: '#6c6783'
  },
  prolog: {
    color: '#6c6783'
  },
  doctype: {
    color: '#6c6783'
  },
  cdata: {
    color: '#6c6783'
  },
  punctuation: {
    color: '#6c6783'
  },
  namespace: {
    Opacity: '.7'
  },
  tag: {
    color: '#3AACE2' // D

  },
  operator: {
    color: '#3AACE2' // D

  },
  number: {
    color: '#3AACE2' // D

  },
  property: {
    color: '#5DFAFC' // D

  },
  function: {
    color: '#5DFAFC' // D

  },
  'tag-id': {
    color: '#eeebff'
  },
  selector: {
    color: '#eeebff'
  },
  'atrule-id': {
    color: '#eeebff'
  },
  'code.language-javascript': {
    color: '#c4b9fe'
  },
  'attr-name': {
    color: '#c4b9fe'
  },
  'code.language-css': {
    color: '#ffffff' // D

  },
  'code.language-scss': {
    color: '#ffffff' // D

  },
  boolean: {
    color: '#ffffff' // D

  },
  string: {
    color: '#ffffff' // D

  },
  entity: {
    color: '#ffffff',
    // D
    cursor: 'help'
  },
  url: {
    color: '#ffffff' // D

  },
  '.language-css .token.string': {
    color: '#ffffff' // D

  },
  '.language-scss .token.string': {
    color: '#ffffff' // D

  },
  '.style .token.string': {
    color: '#ffffff' // D

  },
  'attr-value': {
    color: '#ffffff' // D

  },
  keyword: {
    color: '#ffffff' // D

  },
  control: {
    color: '#ffffff' // D

  },
  directive: {
    color: '#ffffff' // D

  },
  unit: {
    color: '#ffffff' // D

  },
  statement: {
    color: '#ffffff' // D

  },
  regex: {
    color: '#ffffff' // D

  },
  atrule: {
    color: '#ffffff' // D

  },
  placeholder: {
    color: '#ffffff' // D

  },
  variable: {
    color: '#ffffff' // D

  },
  deleted: {
    textDecoration: 'line-through'
  },
  inserted: {
    borderBottom: '1px dotted #eeebff',
    textDecoration: 'none'
  },
  italic: {
    fontStyle: 'italic'
  },
  important: {
    fontWeight: 'bold',
    color: '#c4b9fe'
  },
  bold: {
    fontWeight: 'bold'
  },
  'pre > code.highlight': {
    Outline: '.4em solid #8a75f5',
    OutlineOffset: '.4em'
  },
  '.line-numbers.line-numbers .line-numbers-rows': {
    borderRightColor: '#2c2937'
  },
  '.line-numbers .line-numbers-rows > span:before': {
    color: '#3c3949'
  },
  '.line-highlight.line-highlight': {
    background: 'linear-gradient(to right, rgba(224, 145, 66, 0.2) 70%, rgba(224, 145, 66, 0))'
  }
};

/**
 * Adapted from `material-light`
 * Ref: https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/b2457268891948f7005ccf539a70c000f0695bde/src/styles/prism/material-light.js#L1
 *
 * This theme overwrites colors to be similiar to the `@databricks/editor` theme.
 * Since it is only used for `sql`, in only changes colors for code parts defined in `../lang/sql.ts` (see lines with `// D`)
 */
const databricksLightTheme = {
  'code[class*="language-"]': {
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    color: 'rgb(77, 77, 76)',
    // D
    background: '#fafafa',
    fontFamily: 'Monaco, Menlo, Ubuntu Mono, Consolas, source-code-pro, monospace',
    fontSize: '12px',
    // D
    lineHeight: '1.5em',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none'
  },
  'pre[class*="language-"]': {
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    color: 'rgb(77, 77, 76)',
    // D
    background: '#fafafa',
    fontFamily: 'Monaco, Menlo, Ubuntu Mono, Consolas, source-code-pro, monospace',
    fontSize: '12px',
    // D
    lineHeight: '1.5em',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
    overflow: 'auto',
    position: 'relative',
    margin: '0.5em 0',
    padding: '1.25em 1em'
  },
  'code[class*="language-"]::-moz-selection': {
    background: '#cceae7',
    color: '#263238'
  },
  'pre[class*="language-"]::-moz-selection': {
    background: '#cceae7',
    color: '#263238'
  },
  'code[class*="language-"] ::-moz-selection': {
    background: '#cceae7',
    color: '#263238'
  },
  'pre[class*="language-"] ::-moz-selection': {
    background: '#cceae7',
    color: '#263238'
  },
  'code[class*="language-"]::selection': {
    background: '#cceae7',
    color: '#263238'
  },
  'pre[class*="language-"]::selection': {
    background: '#cceae7',
    color: '#263238'
  },
  'code[class*="language-"] ::selection': {
    background: '#cceae7',
    color: '#263238'
  },
  'pre[class*="language-"] ::selection': {
    background: '#cceae7',
    color: '#263238'
  },
  ':not(pre) > code[class*="language-"]': {
    whiteSpace: 'normal',
    borderRadius: '0.2em',
    padding: '0.1em'
  },
  '.language-css > code': {
    color: '#f5871f' // D

  },
  '.language-sass > code': {
    color: '#f5871f' // D

  },
  '.language-scss > code': {
    color: '#f5871f' // D

  },
  '[class*="language-"] .namespace': {
    Opacity: '0.7'
  },
  atrule: {
    color: '#7c4dff'
  },
  'attr-name': {
    color: '#39adb5'
  },
  'attr-value': {
    color: '#f6a434'
  },
  attribute: {
    color: '#f6a434'
  },
  boolean: {
    color: '#7c4dff' // D

  },
  builtin: {
    color: '#39adb5'
  },
  cdata: {
    color: '#39adb5'
  },
  char: {
    color: '#39adb5'
  },
  class: {
    color: '#39adb5'
  },
  'class-name': {
    color: '#6182b8'
  },
  comment: {
    color: '#8e908c' // D

  },
  constant: {
    color: '#7c4dff' // D

  },
  deleted: {
    color: '#e53935'
  },
  doctype: {
    color: '#aabfc9'
  },
  entity: {
    color: '#e53935'
  },
  function: {
    color: '#4271ae' // D

  },
  hexcode: {
    color: '#f5871f' // D

  },
  id: {
    color: '#7c4dff',
    fontWeight: 'bold'
  },
  important: {
    color: '#7c4dff',
    fontWeight: 'bold'
  },
  inserted: {
    color: '#39adb5'
  },
  keyword: {
    color: '#8959a8' // D

  },
  number: {
    color: '#f5871f' // D

  },
  operator: {
    color: '#3e999f' // D

  },
  prolog: {
    color: '#aabfc9'
  },
  property: {
    color: '#39adb5'
  },
  'pseudo-class': {
    color: '#f6a434'
  },
  'pseudo-element': {
    color: '#f6a434'
  },
  punctuation: {
    color: 'rgb(77, 77, 76)' // D

  },
  regex: {
    color: '#6182b8'
  },
  selector: {
    color: '#e53935'
  },
  string: {
    color: '#3ba85f' // D

  },
  symbol: {
    color: '#7c4dff'
  },
  tag: {
    color: '#e53935'
  },
  unit: {
    color: '#f5871f' // D

  },
  url: {
    color: '#e53935'
  },
  variable: {
    color: '#c72d4c' // D

  }
};

PrismLight.registerLanguage('sql', sql);
const themesStyles = {
  light: databricksLightTheme,
  duotoneDark: databricksDuotoneDarkTheme
};

/**
 * `CodeSnippet` is used for highlighting code, use this instead of
 */
function CodeSnippet(_ref) {
  let {
    theme = 'light',
    language,
    actions,
    style,
    children,
    showLineNumbers,
    lineNumberStyle
  } = _ref;
  const customStyle = {
    border: 'none',
    borderRadius: 0,
    margin: 0,
    padding: snippetPadding,
    ...style
  }; // TODO(dubois): use dubois dark theme directly instead of this hack, when they are available for all FEs
  // this is done in order not to bring all dark theme styles for only action styles

  const actionsTheme = theme === 'duotoneDark' ? {
    color: buttonColorDark,
    hoverColor: buttonHoverColorDark,
    backgroundColor: buttonBackgroundColorDark,
    hoverBackgroundColor: buttonHoverBackgroundColorDark
  } : undefined;
  return jsxs(Fragment, {
    children: [jsx(SnippetActionsContainer, {
      children: jsx(SnippetActionsThemeProvider, {
        theme: actionsTheme,
        children: actions
      })
    }), jsx(PrismLight, {
      showLineNumbers: showLineNumbers,
      lineNumberStyle: lineNumberStyle,
      language: language,
      style: themesStyles[theme],
      customStyle: customStyle,
      codeTagProps: {
        style: _pick(style, 'backgroundColor')
      },
      children: children
    })]
  });
}

function _EMOTION_STRINGIFIED_CSS_ERROR__() { return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop)."; }
const preformattedMessageStyle = /*#__PURE__*/css("font-family:monospace;margin:0;border:none;height:100%;color:inherit;background-color:inherit;padding:", snippetPadding, "px;" + (process.env.NODE_ENV === "production" ? "" : ";label:preformattedMessageStyle;"));
const containerStyle = process.env.NODE_ENV === "production" ? {
  name: "1emh2t",
  styles: "overflow:auto;height:100%"
} : {
  name: "19s78fr-containerStyle",
  styles: "overflow:auto;height:100%;label:containerStyle;",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__
};

/**
 * `ErrorSnippet` is used for displaying large error message, stack-trace  as a data.
 *
 * WARN: It is not meant to be used as an error alert, when you need to display message of a error that
 *  happened after user interaction such as form submit, run a query from the UI, network request errors.
 *  For these cases where you need to provide contextual feedback to a user action, use `Alert` from `dubois`.
 */
function ErrorSnippet(_ref) {
  let {
    children,
    className,
    actions
  } = _ref;
  const {
    theme
  } = useDesignSystemTheme();
  return jsxs(Fragment, {
    children: [jsx(SnippetActionsContainer, {
      children: jsx(SnippetActionsThemeProvider, {
        theme: {
          color: theme.colors.red600,
          hoverColor: theme.colors.red600,
          hoverBackgroundColor: theme.colors.red200
        },
        children: actions
      })
    }), jsx("div", {
      role: "alert",
      css: [containerStyle, {
        color: theme.colors.actionDangerBackgroundDefault,
        backgroundColor: duboisAlertBackgroundColor
      }, process.env.NODE_ENV === "production" ? "" : ";label:ErrorSnippet;"],
      children: jsx("pre", {
        css: preformattedMessageStyle,
        className: className,
        children: children
      })
    })]
  });
}

// `!important` is required to override dubois styles
function importantNullableStyle(styleValue) {
  return styleValue && "".concat(styleValue, " !important");
}

function SnippetActionButton(_ref) {
  let {
    tooltipMessage,
    ...buttonProps
  } = _ref;
  const {
    color,
    hoverColor,
    hoverBackgroundColor,
    backgroundColor
  } = useSnippetActionsTheme();
  const style = /*#__PURE__*/css({
    zIndex: 1,
    // required for action buttons to be visible and float
    // theme
    color: importantNullableStyle(color),
    backgroundColor: importantNullableStyle(backgroundColor),
    ':hover': {
      color: importantNullableStyle(hoverColor),
      backgroundColor: importantNullableStyle(hoverBackgroundColor)
    }
  }, process.env.NODE_ENV === "production" ? "" : ";label:style;");
  return jsx(Tooltip, {
    title: tooltipMessage,
    children: jsx(Button, { ...buttonProps,
      css: style
    })
  });
}

const copyTooltipMessage = jsx(FormattedMessage, {
  id: "1lkAvY",
  defaultMessage: "Copy"
});

const copiedTooltipMessage = jsx(FormattedMessage, {
  id: "zTGoBi",
  defaultMessage: "Copied"
});

function SnippetCopyAction(_ref) {
  let {
    copyText
  } = _ref;
  const clipboard = useClipboard();
  const copiedTimerIdRef = useRef();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    return () => {
      window.clearTimeout(copiedTimerIdRef.current);
    };
  }, []);
  return jsx(SnippetActionButton, {
    tooltipMessage: copied ? copiedTooltipMessage : copyTooltipMessage,
    icon: copied ? jsx(CheckIcon, {}) : jsx(CopyIcon, {}),
    onClick: () => {
      clipboard.copy(copyText);
      window.clearTimeout(copiedTimerIdRef.current);
      setCopied(true);
      copiedTimerIdRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  });
}

const defaultEnterFullScreenTooltip = jsx(FormattedMessage, {
  id: "+68zbh",
  defaultMessage: "Enter fullscreen"
});

const defaultExitFullScreenTooltip = jsx(FormattedMessage, {
  id: "82wi/o",
  defaultMessage: "Exit fullscreen"
});

function SnippetFullScreenAction(_ref) {
  let {
    fullScreen,
    onClick,
    exitFullScreenTooltip = defaultExitFullScreenTooltip,
    enterFullScreenTooltip = defaultEnterFullScreenTooltip
  } = _ref;
  return jsx(SnippetActionButton, {
    tooltipMessage: fullScreen ? exitFullScreenTooltip : enterFullScreenTooltip,
    icon: fullScreen ? jsx(FullscreenExitIcon, {}) : jsx(FullscreenIcon, {}),
    onClick: () => {
      onClick(!fullScreen);
    }
  });
}

export { CodeSnippet, ErrorSnippet, SnippetCopyAction, SnippetFullScreenAction };
//# sourceMappingURL=snippet.js.map
