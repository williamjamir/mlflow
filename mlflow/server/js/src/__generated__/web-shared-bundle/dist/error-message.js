import _toArray from 'lodash/toArray';
import _sum from 'lodash/sum';
import _isFunction from 'lodash/isFunction';
import _countBy from 'lodash/countBy';
import { css } from '@emotion/react';
import { useState, useMemo, useCallback } from 'react';
import { useDesignSystemTheme, ErrorFillIcon, Button, ChevronRightIcon, ChevronDownIcon, Typography, Tooltip, CopyIcon, CloseIcon, useNotification } from '@databricks/design-system';
import { jsxs, jsx } from '@emotion/react/jsx-runtime';
import { useClipboard } from 'use-clipboard-copy';

const ERROR_ICON_SIZE = 20;
const ICON_BUTTON_SIZE = 24;
const ErrorMessage = _ref => {
  let {
    message,
    compact = false,
    copyTooltip = 'Copy',
    copyTextFunc,
    clearTooltip = 'Close',
    clearFunc,
    'data-testid': dataTestId,
    styles = {}
  } = _ref;
  const [collapsed, setCollapsed] = useState(true);
  const {
    theme,
    getPrefixedClassName
  } = useDesignSystemTheme();
  const typographyPrefix = getPrefixedClassName('typography');
  const [textOverflowed, setTextOverflowed] = useState(true);
  const iconCount = _sum(_toArray(_countBy([copyTextFunc, clearFunc], _isFunction))) + 1;
  const iconMargin = theme.spacing.xs;
  const displayMessage = useMemo(() => {
    const trimmedMessage = message.trim();

    if (compact && collapsed) {
      return trimmedMessage.split(/\r?\n/)[0];
    } else {
      return trimmedMessage;
    }
  }, [message, compact, collapsed]);
  const messageWidthRef = useCallback(node => {
    if (node != null) {
      setTextOverflowed(node.parentElement.offsetWidth < node.parentElement.scrollWidth || message.trim() !== displayMessage);
    }
  }, [message, displayMessage]);
  const baseIconButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  const baseTextStyle = {
    fontFamily: 'monospace',
    '::first-letter': {
      textTransform: 'capitalize'
    },
    paddingBottom: theme.spacing.sm
  };
  const containerStyle = {
    background: theme.colors.backgroundSecondary,
    border: "solid 1px ".concat(theme.colors.border),
    borderRadius: theme.borders.borderRadiusMd,
    padding: "".concat(theme.spacing.sm, "px ").concat(theme.spacing.sm, "px 0"),
    display: 'flex',
    overflowY: 'auto',
    flexWrap: 'wrap'
  };
  return jsxs("div", {
    css: /*#__PURE__*/css({ ...containerStyle,
      ...styles
    }, process.env.NODE_ENV === "production" ? "" : ";label:ErrorMessage;"),
    "data-testid": dataTestId,
    children: [jsx(ErrorFillIcon, {
      css: /*#__PURE__*/css("font-size:", ERROR_ICON_SIZE, "px;margin-right:", iconMargin, "px;color:", theme.colors.textValidationDanger, ";" + (process.env.NODE_ENV === "production" ? "" : ";label:ErrorMessage;"))
    }), jsxs("div", {
      css: /*#__PURE__*/css("flex:1 1;.", typographyPrefix, "{margin-bottom:0;}width:", "calc(100% - ".concat((ICON_BUTTON_SIZE + iconMargin) * (1 + iconCount), "px)"), ";" + (process.env.NODE_ENV === "production" ? "" : ";label:ErrorMessage;")),
      children: [compact && textOverflowed && jsx(Button, {
        css: /*#__PURE__*/css({ ...baseIconButtonStyles,
          marginRight: iconMargin,
          float: 'left'
        }, process.env.NODE_ENV === "production" ? "" : ";label:ErrorMessage;"),
        icon: collapsed ? jsx(ChevronRightIcon, {}) : jsx(ChevronDownIcon, {}),
        "aria-label": collapsed ? 'Expand' : 'Collapse',
        onClick: () => {
          setCollapsed(!collapsed);
        },
        size: "small"
      }), ' ', jsx(Typography, {
        children: compact && collapsed ? jsx(Typography.Text, {
          ellipsis: true,
          css: /*#__PURE__*/css({ ...baseTextStyle,
            width: "calc(100% - ".concat(ICON_BUTTON_SIZE + iconMargin, "px)")
          }, process.env.NODE_ENV === "production" ? "" : ";label:ErrorMessage;"),
          children: jsx("span", {
            ref: messageWidthRef,
            children: displayMessage
          })
        }) : jsx(Typography.Paragraph, {
          css: /*#__PURE__*/css({ ...baseTextStyle,
            whiteSpace: 'break-spaces'
          }, process.env.NODE_ENV === "production" ? "" : ";label:ErrorMessage;"),
          children: displayMessage
        })
      })]
    }), copyTextFunc && jsx(Tooltip, {
      title: copyTooltip,
      children: jsx(Button, {
        css: /*#__PURE__*/css({ ...baseIconButtonStyles,
          marginLeft: iconMargin
        }, process.env.NODE_ENV === "production" ? "" : ";label:ErrorMessage;"),
        icon: jsx(CopyIcon, {
          css: /*#__PURE__*/css("color:", theme.colors.textSecondary, ";" + (process.env.NODE_ENV === "production" ? "" : ";label:ErrorMessage;"))
        }),
        onClick: copyTextFunc,
        "aria-label": "Copy",
        size: "small"
      })
    }), clearFunc && jsx(Tooltip, {
      title: clearTooltip,
      children: jsx(Button, {
        css: /*#__PURE__*/css({ ...baseIconButtonStyles,
          marginLeft: iconMargin
        }, process.env.NODE_ENV === "production" ? "" : ";label:ErrorMessage;"),
        icon: jsx(CloseIcon, {
          css: /*#__PURE__*/css("color:", theme.colors.textSecondary, ";" + (process.env.NODE_ENV === "production" ? "" : ";label:ErrorMessage;"))
        }),
        onClick: clearFunc,
        "aria-label": "Close",
        size: "small"
      })
    })]
  });
};

const useCopyText = _ref => {
  let {
    text,
    successNotificationText = 'Copied to clipboard',
    errorNotificationText = 'Failed to copy to clipboard'
  } = _ref;
  const [notificationAPI, notificationContextHolder] = useNotification();
  const clipboard = useClipboard({
    onSuccess() {
      notificationAPI.success({
        placement: 'bottomRight',
        message: successNotificationText
      });
    },

    onError() {
      notificationAPI.error({
        placement: 'bottomRight',
        message: errorNotificationText
      });
    }

  });
  const copyText = useCallback(() => {
    clipboard.copy(text);
  }, [clipboard, text]);
  return [copyText, notificationContextHolder];
};

export { ErrorMessage, useCopyText };
//# sourceMappingURL=error-message.js.map
