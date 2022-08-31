import 'react';
import { Modal } from '@databricks/design-system';
import { jsx } from '@emotion/react/jsx-runtime';

function SearchModalBase(_ref) {
  let {
    title,
    visible,
    onCancel,
    children
  } = _ref;
  return jsx(Modal, {
    title: title,
    visible: visible,
    onCancel: onCancel,
    size: "wide",
    destroyOnClose: true,
    footer: null,
    children: children
  });
}

export { SearchModalBase };
//# sourceMappingURL=search.js.map
