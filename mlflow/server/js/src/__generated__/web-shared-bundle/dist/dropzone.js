import 'react';
import '@emotion/react';
import { useDropzone } from 'react-dropzone';
import { jsxs, jsx } from '@emotion/react/jsx-runtime';

function _EMOTION_STRINGIFIED_CSS_ERROR__() { return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop)."; }
const styles = {
  dropzone: process.env.NODE_ENV === "production" ? {
    name: "1xivvva",
    styles: "background-color:rgba(34, 114, 180, 8%);border:dashed 4px #2272b4;border-radius:4px;height:calc(100% - 8px);left:0;position:absolute;top:0;width:calc(100% - 8px);z-index:10"
  } : {
    name: "k14q22-dropzone",
    styles: "background-color:rgba(34, 114, 180, 8%);border:dashed 4px #2272b4;border-radius:4px;height:calc(100% - 8px);left:0;position:absolute;top:0;width:calc(100% - 8px);z-index:10;label:dropzone;",
    toString: _EMOTION_STRINGIFIED_CSS_ERROR__
  }
};

const useFileDropzone = _ref => {
  let {
    noClick,
    noDrag,
    noKeyboard,
    onDrop
  } = _ref;
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    noClick,
    noDrag,
    noKeyboard,
    onDrop
  });
  return {
    getRootProps,
    getInputProps,
    isDragActive
  };
};

const FileDropzone = _ref => {
  let {
    children,
    location,
    onDrop,
    noClick,
    noDrag,
    noKeyboard,
    enabled = true
  } = _ref;
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useFileDropzone({
    noClick,
    noDrag,
    noKeyboard,
    onDrop
  });

  if (enabled) {
    return jsxs("span", { ...getRootProps(),
      "data-testid": "dropzone-".concat(location),
      children: [jsx("input", { ...getInputProps(),
        "data-testid": "dropzone-".concat(location, "-input")
      }), children, isDragActive && jsx("div", {
        css: styles.dropzone
      })]
    });
  }

  return children;
};

export { FileDropzone };
//# sourceMappingURL=dropzone.js.map
