import { RULESET } from 'stylis';

/**
 * Adds an extra scope to all generated class names for mlflow-css
 * offering them higher CSS specificity.
 * @param scope the name of the extra scope
 */
export function stylisExtraScopePlugin(scope) {
  const extraScopePlugin = (element) => {
    if (
      element.type === RULESET &&
      element.props.length &&
      element.props[0].startsWith('.mlflow-css-')
    ) {
      // eslint-disable-next-line no-param-reassign
      element.props[0] = `${scope} ${element.props[0]}`;
    }
    return undefined;
  };
  return extraScopePlugin;
}
