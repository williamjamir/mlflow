import { css } from '@emotion/react';
import { useDesignSystemTheme } from '@databricks/design-system';
import { jsx } from '@emotion/react/jsx-runtime';

// Grid style values were specifically chosen to match the DAG designs.
const BACKGROUND_GRID_GAP_SIZE = 5;
const BACKGROUND_GRID_STROKE_SIZE = 0.75; // The graph inner padding is the distance that overlaying elements such as the mini-map and
// controls should be positioned from the edge of the graph.
// matches design system spacing.md

const GRAPH_INNER_PADDING = 16;

function DAGControlWrapper(_ref) {
  let {
    children
  } = _ref;
  const {
    theme
  } = useDesignSystemTheme();
  const buttonSize = theme.spacing.md * 2; // 32px

  const controlStyle = /*#__PURE__*/css({
    '.react-flow__controls': {
      // Position controls panel on bottom-right.
      bottom: GRAPH_INNER_PADDING,
      right: GRAPH_INNER_PADDING,
      left: 'auto',
      top: 'auto',
      border: 'none',
      boxShadow: 'none',
      // customize button style
      '.react-flow__controls-button': {
        height: buttonSize,
        width: buttonSize,
        marginTop: theme.spacing.xs,
        padding: 0,
        fontSize: theme.typography.fontSizeXl,
        // 22px
        background: theme.colors.backgroundPrimary,
        color: theme.colors.textSecondary,
        // change the default react flow svg color
        fill: theme.colors.textSecondary,
        borderRadius: theme.spacing.xs,
        border: "solid 1px ".concat(theme.colors.borderDecorative),
        boxSizing: 'border-box',
        // Prevent the first control from having a margin on top of it.
        // This is because `marginTop` is used to add space between the controls, however,
        // the first control does not have a control above it so `marginTop` is not needed
        // and will unnecessarily increase the height of the controls component.
        '&:first-of-type': {
          marginTop: 0
        },
        '&:hover': {
          background: theme.colors.backgroundSecondary
        }
      }
    }
  }, process.env.NODE_ENV === "production" ? "" : ";label:controlStyle;");
  return jsx("div", {
    css: controlStyle,
    children: children
  });
}

export { BACKGROUND_GRID_GAP_SIZE, BACKGROUND_GRID_STROKE_SIZE, DAGControlWrapper, GRAPH_INNER_PADDING };
//# sourceMappingURL=dag.js.map
