import React, { useRef, useCallback, useContext, useMemo, useReducer, createContext, useEffect, useState } from 'react';
import _noop from 'lodash/noop';
import { O as OnboardingStorage } from './OnboardingStorage-2f12f38b.js';
import _isFunction from 'lodash/isFunction';
import { jsx, jsxs } from '@emotion/react/jsx-runtime';
import { css } from '@emotion/react';
import { useDesignSystemTheme, Tooltip, Button, CloseIcon, CheckCircleBorderIcon, ArrowRightIcon, Typography, Header, ArrowLeftIcon, CheckCircleFillIcon, DataIcon, DashboardIcon, QueryNavIcon } from '@databricks/design-system';
import { FormattedMessage } from '@databricks/i18n';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { d as defineEvent } from './events-2e8c7eb1.js';
import _styled from '@emotion/styled/base';
import 'lodash/truncate';
import './RandomUtils-95541717.js';
import 'invariant';
import 'lodash/isPlainObject';
import 'lodash/isDate';

// function so it's safe to use it with other hooks: wrapper function stays the same,
// but will always call a latest wrapped function.
// A quick note regarding `react-hooks/exhaustive-deps`: since wrapper function doesn't
// change, it's safe to use it as a dependency, it will never trigger other hooks.

function useImmutableCallback(callback) {
  const callbackRef = useRef();
  callbackRef.current = _isFunction(callback) ? callback : _noop; // eslint-disable-next-line react-hooks/exhaustive-deps

  return useCallback(function () {
    var _callbackRef$current;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return (_callbackRef$current = callbackRef.current) === null || _callbackRef$current === void 0 ? void 0 : _callbackRef$current.call(callbackRef, ...args);
  }, []);
}

const OnboardingConfig = /*#__PURE__*/createContext({
  recordEvent: (a, b, c) => {},
  conf: {
    isAdmin: false,
    cloud: '',
    enableOnboarding: false,
    userId: '',
    orgId: ''
  }
});
const OnboardingContext = /*#__PURE__*/createContext({
  isVisible: false,
  isEnabled: false,
  hasSkipped: false,
  onboardingChecks: {},
  hide: _noop,
  show: _noop,
  skip: _noop,
  reset: _noop
});

function useOnboardingSettingsController(onboardingChecks) {
  var _storage$isVisible, _onboardingChecks$che;

  const isEnabled = useOnboardingEnabled();
  const storage = useOnboardingStorage();
  const [isVisible, setIsVisible] = useReducer((_state, visible) => {
    storage.isVisible = visible;
    return visible;
  }, isEnabled && ((_storage$isVisible = storage.isVisible) !== null && _storage$isVisible !== void 0 ? _storage$isVisible : false));
  const {
    skip,
    hasSkipped,
    reset: resetSkip
  } = useOnboardingSkip();
  const hasNoVisibilitySettings = typeof storage.isVisible === 'undefined';
  const checksTodo = (_onboardingChecks$che = onboardingChecks.checksTodo) !== null && _onboardingChecks$che !== void 0 ? _onboardingChecks$che : 0;
  useEffect(() => {
    if (checksTodo && hasNoVisibilitySettings) {
      // Some checks left and user hasn't explicitly hidden panel. Show it
      setIsVisible(true);
    }
  }, [checksTodo, hasNoVisibilitySettings]);
  return {
    isVisible: isVisible && !hasSkipped,
    isEnabled,
    onboardingChecks: onboardingChecks.checks,
    hide: () => setIsVisible(false),
    show: () => setIsVisible(true),
    skip,
    hasSkipped,
    reset: () => {
      resetSkip();
      onboardingChecks.reset();
    }
  };
}

function OnboardingContextProvider(props) {
  const onboardingSettings = useOnboardingSettingsController(props.onboardingChecks);
  return jsx(OnboardingContext.Provider, {
    value: { ...onboardingSettings
    },
    ...props
  });
}
function useOnboardingController() {
  return useContext(OnboardingContext);
}
function useOnboardingCheck(name) {
  const context = useOnboardingController();
  return context.onboardingChecks[name];
}
function OnboardingConfigProvider(props) {
  return jsx(OnboardingConfig.Provider, {
    value: props.config
  });
}
function useOnboardingConfig() {
  return useContext(OnboardingConfig);
}
function useOnboardingEnabled() {
  const onboarding = useOnboardingController();
  return onboarding.isEnabled;
}
function useOnboardingStorage() {
  const config = useOnboardingConfig();
  const {
    orgId,
    userId
  } = config.conf;
  return useMemo(() => new OnboardingStorage(orgId, userId), [orgId, userId]);
}
function useOnboardingSkip() {
  const storage = useOnboardingStorage();
  const [hasSkipped, setSkipped] = useReducer((current, next) => {
    storage.hasSkipped = next;
    return next;
  }, storage.hasSkipped);
  return {
    skip: () => setSkipped(true),
    hasSkipped,
    reset: () => {}
  };
}

function useCachedOnboardingCheck(check) {
  const storage = useOnboardingStorage();
  return useMemo(() => storage.getOnboardingCheck(check), [check, storage]);
}
function useCacheCompletedOnboardingCheckEffect(check, isCompleted) {
  const storage = useOnboardingStorage();
  useEffect(() => {
    if (isCompleted) {
      storage.setOnboardingCheck(check, isCompleted);
    }
  }, [storage, isCompleted, check]);
}
function useResetCachedOnboardingChecks() {
  const storage = useOnboardingStorage();
  return function () {
    for (var _len = arguments.length, checks = new Array(_len), _key = 0; _key < _len; _key++) {
      checks[_key] = arguments[_key];
    }

    return checks.map(check => storage.setOnboardingCheck(check, false));
  };
}

const TutorialRouterContext = /*#__PURE__*/React.createContext({
  pushPage: _noop,
  popPage: _noop,
  goHome: _noop
});
function TutorialRoutes(_ref) {
  let {
    initialRoute
  } = _ref;
  const [routeStack, setRouteStack] = useState([initialRoute]);
  const currentRoute = routeStack[0];

  const pushPage = page => setRouteStack([page, ...routeStack]);

  const popPage = () => setRouteStack(stack => stack.slice(1));

  const goHome = () => setRouteStack([initialRoute]);

  return jsx(TutorialRouterContext.Provider, {
    value: {
      pushPage,
      popPage,
      goHome
    },
    children: currentRoute
  });
}
function useTutorialRoute() {
  return React.useContext(TutorialRouterContext);
}
/**
 * @deprecated
 */

function useTutorialRouter(initialRoute) {
  const [routeStack, setRouteStack] = useState([initialRoute]);

  const pushPage = page => setRouteStack([page, ...routeStack]);

  const popPage = () => setRouteStack(routeStack.slice(1));

  const goHome = () => setRouteStack([initialRoute]);

  const CurrentRoute = routeStack[0];
  return {
    currentRoute: CurrentRoute,
    pushPage,
    popPage,
    goHome
  };
}

let OnboardingAction;

(function (OnboardingAction) {
  OnboardingAction["TutorialAbandon"] = "abandon";
  OnboardingAction["GuidedNavigationForCheck"] = "navigate";
  OnboardingAction["CheckCompleted"] = "completeCheck";
  OnboardingAction["MarkAsDone"] = "markAsDone";
})(OnboardingAction || (OnboardingAction = {}));

const ONBOARDING_EVENT_OBJECT_TYPE = 'onboarding';
function useOnboardingRecorders() {
  const config = useOnboardingConfig();

  function recordOnboardingAction(action, objectId) {
    config.recordEvent && config.recordEvent(action, ONBOARDING_EVENT_OBJECT_TYPE, objectId);
  }

  function recordCompletedOnboardingCheck(checkName) {
    recordOnboardingAction(OnboardingAction.CheckCompleted, checkName);
  }

  function recordMarkAsDoneOnboardingCheck(checkName) {
    recordOnboardingAction(OnboardingAction.MarkAsDone, checkName);
  }

  function withOnboardingEventRecorder(callback, action, checkName) {
    return function () {
      recordOnboardingAction(action, checkName);
      return callback(...arguments);
    };
  }

  return {
    recordOnboardingAction,
    recordCompletedOnboardingCheck,
    recordMarkAsDoneOnboardingCheck,
    withOnboardingEventRecorder
  };
}
function useCallbackWithOnboardingEventRecorder(callback, action, objectId) {
  const recorders = useOnboardingRecorders();

  const callbackWithEventRecorder = function () {
    recorders.recordOnboardingAction(action, objectId);
    return callback(...arguments);
  };

  return useImmutableCallback(callbackWithEventRecorder);
}
function useRecordOnboardingCheckCompletedEvent(checkName, isCompleted) {
  const recorders = useOnboardingRecorders();
  useEffect(() => {
    if (isCompleted) {
      recorders.recordCompletedOnboardingCheck(checkName);
    }
  }, [isCompleted, checkName, recorders]);
}
const tutorialVisibilityChanged = defineEvent('tutorial:visibility-changed');
const tutorialTaskStatusChanged = defineEvent('tutorial:task-status-changed');

const TUTORIAL_STORAGE_PREFIX = 'tutorial';
class TutorialStorage {
  constructor(_activeStorageId) {
    this._activeStorageId = _activeStorageId;
  }
  /**
   * Get final key string of the specific task in local storage
   *
   * @example tutorial-user_12345-account-56789-task-createUnityCatalog
   */


  _getTaskStorageKey(taskKey) {
    return [TUTORIAL_STORAGE_PREFIX, this._activeStorageId, 'task', taskKey].join('-');
  }

  _getVisibilityStorageKey() {
    return [TUTORIAL_STORAGE_PREFIX, this._activeStorageId, 'visibility'].join('-');
  }

  getTask(taskKey) {
    var _window$localStorage$;

    const taskStorageKey = this._getTaskStorageKey(taskKey);

    return JSON.parse((_window$localStorage$ = window.localStorage.getItem(taskStorageKey)) !== null && _window$localStorage$ !== void 0 ? _window$localStorage$ : 'null');
  }

  updateTask(taskKey, taskProps) {
    const taskStorageKey = this._getTaskStorageKey(taskKey);

    const cachedTask = this.getTask(taskKey);
    const newTask = { ...cachedTask,
      ...taskProps
    };
    window.localStorage.setItem(taskStorageKey, JSON.stringify(newTask));
    return newTask;
  }

  getVisibility() {
    var _window$localStorage$2;

    const visibilityStorageKey = this._getVisibilityStorageKey(); // Default to true


    return JSON.parse((_window$localStorage$2 = window.localStorage.getItem(visibilityStorageKey)) !== null && _window$localStorage$2 !== void 0 ? _window$localStorage$2 : 'true');
  }

  updateVisibility(isVisible) {
    const visibilityStorageKey = this._getVisibilityStorageKey();

    window.localStorage.setItem(visibilityStorageKey, JSON.stringify(isVisible));
  }

}

function useTutorialStorage(storageId, tutorialTasks) {
  const tutorialStorage = useRef(new TutorialStorage(storageId));
  const [cachedTaskStatusMap, setCachedTaskStatusMap] = useState(tutorialTasks.tasks.reduce((map, _ref) => {
    let {
      key
    } = _ref;
    return { ...map,
      [key]: tutorialStorage.current.getTask(key)
    };
  }, {}));
  const handleTaskStatusChanged = useCallback(_ref2 => {
    let {
      tutorialTaskKey,
      isCompleted
    } = _ref2;
    tutorialStorage.current.updateTask(tutorialTaskKey, {
      isCompleted
    });
    setCachedTaskStatusMap(oldStatusMap => ({ ...oldStatusMap,
      [tutorialTaskKey]: { ...oldStatusMap[tutorialTaskKey],
        isCompleted
      }
    }));
  }, []);
  tutorialTaskStatusChanged.useListener(handleTaskStatusChanged);
  return {
    cachedTaskStatusMap,
    tutorialStorage: tutorialStorage.current
  };
}

class TutorialTasks {
  constructor(tasksList) {
    _defineProperty(this, "tasksMap", {});

    _defineProperty(this, "tasks", []);

    this.tasks = tasksList;
    tasksList.forEach(task => {
      this.tasksMap[task.key] = task;
    });
  }

}
const TutorialContext = /*#__PURE__*/createContext({
  tutorialTasks: {},
  cachedTaskStatusMap: {},
  showTutorial: _noop,
  hideTutorial: _noop
});
function TutorialProvider(_ref) {
  let {
    enabled,
    tutorialTasks,
    storageId,
    children
  } = _ref;
  const {
    cachedTaskStatusMap,
    tutorialStorage
  } = useTutorialStorage(storageId, tutorialTasks);
  const [isVisible, setIsVisible] = useState(tutorialStorage.getVisibility());

  const showTutorial = () => {
    tutorialStorage.updateVisibility(true);
    setIsVisible(true);
  };

  const hideTutorial = () => {
    tutorialStorage.updateVisibility(false);
    setIsVisible(false);
  };

  const handleVisibilityChanged = useCallback(_ref2 => {
    let {
      visible
    } = _ref2;
    if (visible) showTutorial();else hideTutorial(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  tutorialVisibilityChanged.useListener(handleVisibilityChanged);

  if (enabled && isVisible) {
    return jsx(TutorialContext.Provider, {
      value: {
        showTutorial,
        hideTutorial,
        tutorialTasks,
        cachedTaskStatusMap
      },
      children: children
    });
  }

  return null;
}
function useTutorialContext() {
  return useContext(TutorialContext);
}

function useOnboardingStyles() {
  const {
    theme
  } = useDesignSystemTheme();
  return {
    tutorialPanelColors: {
      sidebarMenuColor: '#dce0e2',
      // Non-DS color TODO: This color is also coded like this in webapp/web/js/shared_package/persona-nav/colors.ts
      backgroundColor: theme.colors.grey200 //'#E4EBF0',

    },
    tutorialButtonColors: {
      adminTaskButtonBackground: '#C6E0CC',
      adminTaskButtonIconBackground: '#50AF7D',
      userTaskButtonBackground: '#789CAA',
      userTaskButtonIconBackground: '#2B5161',
      adminTaskButtonBackgroundOnHover: '#CDE8D3',
      adminTaskButtonIconBackgroundOnHover: '#54B883',
      userTaskButtonBackgroundOnHover: '#87AFBF',
      userTaskButtonIconBackgroundOnHover: '#325E70',
      completedTaskButtonBackground: 'rgba(255, 255, 255, 0.5)',
      completedTaskButtonBackgroundOnHover: 'rgba(255, 255, 255, 0.6)',
      completedTaskButtonTextColor: '#33804C'
    },
    duboisColors: {
      backgroundPrimary: theme.colors.backgroundPrimary,
      typePrimary: '#2F3941',
      typeSecondary: theme.colors.textValidationInfo,
      typeSecondaryInverse: 'rgba(255, 255, 255, 0.75)'
    }
  };
}
const tutorialPanelDimensions = {
  width: '366px',
  paddingHorizontal: '24px',
  paddingVertical: '32px'
};
const tutorialButtonDimensions = {
  padding: '17px',
  iconSize: '20px',
  marginBottom: '8px'
};
const adminOnboardingButtonContainerVerticalSpacing = '32px';
const duboisFonts = {
  header2Size: '22px',
  header3Size: '18px'
};
const tutorialDescriptionItemMargin = '24px';
const antdDefaultSizeButtonVerticalPadding = '4.8px';

function _EMOTION_STRINGIFIED_CSS_ERROR__$2() { return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop)."; }

var _ref$1 = process.env.NODE_ENV === "production" ? {
  name: "1qb8qzq",
  styles: "position:absolute;top:12px;right:12px"
} : {
  name: "14iuwze-closeButtonStyle",
  styles: "position:absolute;top:12px;right:12px;label:closeButtonStyle;",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__$2
};

function TutorialSidebar(_ref2) {
  let {
    initialRoute
  } = _ref2;
  const {
    hideTutorial
  } = useTutorialContext();
  const {
    goHome
  } = useTutorialRoute();
  const styles = useOnboardingStyles();
  const azureToolbarHeight = 40; // see @databricks/persona-nav/src/components/cloud_provider_toolbar/AzureToolbar

  const sidebarStyle = /*#__PURE__*/css("height:100vh;flex-shrink:0;overflow-y:auto;background:", styles.tutorialPanelColors.backgroundColor, ";display:flex;flex-direction:column;transition-duration:0.3s;transition-property:width;width:", tutorialPanelDimensions.width, ";animation-fill-mode:both;animation-duration:0.3s;position:relative;.databricks-application-wrapper.databricks-application-wrapper--with-azure-toolbar &{height:calc(100vh - ", azureToolbarHeight, "px);}" + (process.env.NODE_ENV === "production" ? "" : ";label:sidebarStyle;"));
  const closeButtonStyle = _ref$1;
  return jsxs("div", {
    css: sidebarStyle,
    children: [jsx(TutorialRoutes, {
      initialRoute: initialRoute
    }), jsx(Tooltip, {
      placement: "right",
      title: jsx(FormattedMessage, {
        id: "5hCfHA",
        defaultMessage: "Hide tutorial (can be reopened from the Help menu on the sidebar)"
      }),
      children: jsx(Button, {
        css: closeButtonStyle,
        icon: jsx(CloseIcon, {}),
        onClick: () => {
          hideTutorial(); // Whenever user reopens collapsed onboarding, we'll always reopen it on main panel

          goHome();
        }
      })
    })]
  });
}

function _EMOTION_STRINGIFIED_CSS_ERROR__$1() { return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop)."; }

/**
 * @deprecated
 */
function AutoTutorialButton(props) {
  const {
    pushPage
  } = React.useContext(TutorialRouterContext);
  const myCheck = useOnboardingCheck(props.checkName);
  return jsx(LegacyTutorialButton, {
    onClick: () => pushPage(props.targetPage()),
    completed: myCheck.isCompleted,
    ...props,
    children: "props.title"
  });
}
/**
 * @deprecated
 */

var _ref2 = process.env.NODE_ENV === "production" ? {
  name: "1t8eddt",
  styles: "flex-grow:1;text-align:left"
} : {
  name: "18isbcs-UnStyledTutorialButton",
  styles: "flex-grow:1;text-align:left;label:UnStyledTutorialButton;",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__$1
};

function UnStyledTutorialButton(_ref) {
  let {
    children,
    variant,
    completed = false,
    onClick,
    eventName,
    ...props
  } = _ref;
  const onClickWithEventRecorder = useCallbackWithOnboardingEventRecorder(onClick, OnboardingAction.GuidedNavigationForCheck, eventName);
  return jsxs(Button, { ...props,
    block: true,
    onClick: onClickWithEventRecorder,
    children: [jsx("span", {
      css: _ref2,
      children: children
    }), completed ? jsx(CheckCircleBorderIcon, {
      "aria-label": "completed"
    }) : jsx(ArrowRightIcon, {})]
  });
}

/**
 * @deprecated
 */
function LegacyTutorialButton(props) {
  const onboardingStyles = useOnboardingStyles();
  const {
    duboisColors,
    tutorialButtonColors
  } = onboardingStyles;
  const StyledTutorialButton = React.useMemo(() => {
    const colorMap = {
      admin: {
        buttonBackground: tutorialButtonColors.adminTaskButtonBackground,
        iconBackground: tutorialButtonColors.adminTaskButtonIconBackground,
        buttonBackgroundOnHover: tutorialButtonColors.adminTaskButtonBackgroundOnHover,
        iconBackgroundOnHover: tutorialButtonColors.adminTaskButtonIconBackgroundOnHover,
        text: duboisColors.typePrimary,
        arrow: duboisColors.typeSecondary,
        textWhenCompleted: tutorialButtonColors.completedTaskButtonTextColor
      },
      user: {
        buttonBackground: tutorialButtonColors.userTaskButtonBackground,
        iconBackground: tutorialButtonColors.userTaskButtonIconBackground,
        buttonBackgroundOnHover: tutorialButtonColors.userTaskButtonBackgroundOnHover,
        iconBackgroundOnHover: tutorialButtonColors.userTaskButtonIconBackgroundOnHover,
        text: duboisColors.backgroundPrimary,
        arrow: duboisColors.backgroundPrimary,
        textWhenCompleted: tutorialButtonColors.userTaskButtonIconBackground
      }
    };
    return /*#__PURE__*/_styled(UnStyledTutorialButton, process.env.NODE_ENV === "production" ? {
      target: "etp0sj70"
    } : {
      target: "etp0sj70",
      label: "StyledTutorialButton"
    })("display:flex;align-items:center;padding:0 ", tutorialButtonDimensions.padding, " 0 0;border:none;height:auto;color:", _ref3 => {
      let {
        variant,
        completed
      } = _ref3;
      return completed ? colorMap[variant].textWhenCompleted : colorMap[variant].text;
    }, ";transition:background-color 180ms linear;background-color:", _ref4 => {
      let {
        variant,
        completed
      } = _ref4;
      return completed ? tutorialButtonColors.completedTaskButtonBackground : colorMap[variant].buttonBackground;
    }, ";.anticon:first-of-type{color:", duboisColors.typeSecondaryInverse, ";padding:", tutorialButtonDimensions.padding, ";background-color:", _ref5 => {
      let {
        variant
      } = _ref5;
      return colorMap[variant].iconBackground;
    }, ";transition:inherit;}.anticon:last-of-type{color:", _ref6 => {
      let {
        variant,
        completed
      } = _ref6;
      return completed ? tutorialButtonColors.completedTaskButtonTextColor : colorMap[variant].arrow;
    }, ";}.anticon{font-size:", tutorialButtonDimensions.iconSize, ";}&:hover,&:focus{background-color:", _ref7 => {
      let {
        variant,
        completed
      } = _ref7;
      return completed ? tutorialButtonColors.completedTaskButtonBackgroundOnHover : colorMap[variant].buttonBackgroundOnHover;
    }, ";color:", _ref8 => {
      let {
        variant,
        completed
      } = _ref8;
      return completed ? colorMap[variant].textWhenCompleted : colorMap[variant].text;
    }, ";.anticon:first-of-type{background-color:", _ref9 => {
      let {
        variant
      } = _ref9;
      return colorMap[variant].iconBackgroundOnHover;
    }, ";}}");
  }, [duboisColors, tutorialButtonColors]);
  return jsx(StyledTutorialButton, { ...props
  });
}

var _ref11 = process.env.NODE_ENV === "production" ? {
  name: "1t8eddt",
  styles: "flex-grow:1;text-align:left"
} : {
  name: "l5pcx-TutorialButton",
  styles: "flex-grow:1;text-align:left;label:TutorialButton;",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__$1
};

function TutorialButton(_ref10) {
  let {
    icon,
    variant,
    targetTutorialPage,
    tutorialTaskKey,
    onClick,
    children
  } = _ref10;
  const {
    theme
  } = useDesignSystemTheme();
  const {
    pushPage
  } = useTutorialRoute();
  const {
    tutorialTasks
  } = useTutorialContext();
  const {
    isCompleted
  } = tutorialTasks.tasksMap[tutorialTaskKey].useTutorialTaskStatus();
  /**
   * Keep using some pre-existing hard-code color theme to have consistent UX
   * till all the applications migrate to this shared tutorial component
   * then will work with designer to switch to dubois color theme later
   */

  const colorMap = {
    admin: {
      icon: {
        background: '#50af7d',
        backgroundOnHover: '#54b883'
      },
      completed: {
        background: theme.colors.grey100,
        backgroundOnHover: undefined,
        color: theme.colors.green600
      },
      todo: {
        background: '#c6e0cc',
        backgroundOnHover: '#cde8d3',
        color: theme.colors.textPrimary
      }
    },
    user: {
      icon: {
        background: '#2b5161',
        backgroundOnHover: '#325e70'
      },
      completed: {
        background: theme.colors.grey100,
        backgroundOnHover: undefined,
        color: theme.colors.grey800
      },
      todo: {
        background: '#789caa',
        backgroundOnHover: '#87afbf',
        color: theme.colors.actionPrimaryTextDefault
      }
    }
  };
  const colorGroup = isCompleted ? 'completed' : 'todo';
  const buttonStyles = /*#__PURE__*/css("border:none;cursor:pointer;padding:0;transition:background-color 180ms linear;display:flex;align-items:center;justify-content:space-around;width:100%;background:", colorMap[variant][colorGroup].background, ";margin-bottom:", theme.spacing.sm, "px;>.anticon{font-size:20px;padding:", theme.spacing.md, "px;transition:inherit;&:first-of-type{color:rgba(255, 255, 255, 0.75);background-color:", colorMap[variant].icon.background, ";}+span{margin:0 ", theme.spacing.sm, "px;color:", colorMap[variant][colorGroup].color, ";}&:last-of-type{color:", colorMap[variant][colorGroup].color, ";}}&:hover,&:focus{background-color:", colorMap[variant][colorGroup].backgroundOnHover, ";.anticon:first-of-type{background-color:", colorMap[variant].icon.backgroundOnHover, ";}}" + (process.env.NODE_ENV === "production" ? "" : ";label:buttonStyles;"));

  const handleClick = function () {
    pushPage(targetTutorialPage);
    onClick(...arguments);
  };

  return jsxs("button", {
    onClick: handleClick,
    css: buttonStyles,
    children: [icon, jsx("span", {
      css: _ref11,
      children: children
    }), isCompleted ? jsx(CheckCircleBorderIcon, {
      "aria-label": "".concat(tutorialTaskKey, "-completed")
    }) : jsx(ArrowRightIcon, {
      "aria-label": "".concat(tutorialTaskKey, "-todo")
    })]
  });
}

// `!important` to override antd h3 style
const subtitleStyle = /*#__PURE__*/css("font-size:", duboisFonts.header3Size, "!important;margin-bottom:calc(", tutorialDescriptionItemMargin, " - 8px);" + (process.env.NODE_ENV === "production" ? "" : ";label:subtitleStyle;"));
function TutorialSubtitle(_ref) {
  let {
    children
  } = _ref;
  return jsx(Typography.Title, {
    level: 3,
    css: subtitleStyle,
    children: children
  });
}

function _EMOTION_STRINGIFIED_CSS_ERROR__() { return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop)."; }
const pageContainerStyle = process.env.NODE_ENV === "production" ? {
  name: "1lh7kdz",
  styles: "flex-grow:1;display:flex;flex-direction:column"
} : {
  name: "r6glkm-pageContainerStyle",
  styles: "flex-grow:1;display:flex;flex-direction:column;label:pageContainerStyle;",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__
};
const pageHeaderStyle = process.env.NODE_ENV === "production" ? {
  name: "ik2lv1",
  styles: "padding:15px 56px 56px 24px"
} : {
  name: "rn7kl6-pageHeaderStyle",
  styles: "padding:15px 56px 56px 24px;label:pageHeaderStyle;",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__
};
const skipButtonStyle = /*#__PURE__*/css("margin-bottom:calc(", tutorialDescriptionItemMargin, " - ", antdDefaultSizeButtonVerticalPadding, ");" + (process.env.NODE_ENV === "production" ? "" : ";label:skipButtonStyle;"));
/**
 * @deprecated
 */

function LegacyTutorialPage(_ref2) {
  let {
    children,
    isCompleted,
    title,
    description,
    hasBack = true,
    skipButton,
    nextStepButton
  } = _ref2;
  const {
    duboisColors
  } = useOnboardingStyles();
  const pageContentStyle = /*#__PURE__*/css("flex-grow:1;padding:0 ", tutorialPanelDimensions.paddingHorizontal, " ", tutorialPanelDimensions.paddingVertical, " ", tutorialPanelDimensions.paddingHorizontal, ";p{color:", duboisColors.typePrimary, ";margin-bottom:", tutorialDescriptionItemMargin, ";}" + (process.env.NODE_ENV === "production" ? "" : ";label:pageContentStyle;"));
  return jsxs("div", {
    css: pageContainerStyle,
    children: [jsx("div", {
      css: pageHeaderStyle,
      children: jsx(Header, {
        title: jsx("div", {
          role: "heading",
          "aria-level": 3,
          children: title
        })
      })
    }), jsxs("div", {
      css: pageContentStyle,
      children: [isCompleted && // todo: design-system alert doesn't allow success notification
      // <Alert
      //   type="success"
      //   role="alert"
      //   css={{ marginBottom: tutorialDescriptionItemMargin }}
      //   message={<FormattedMessage defaultMessage="Completed" description="Onboarding: Completed alert" />}
      // />
      jsx(FormattedMessage, {
        id: "2YX1v/",
        defaultMessage: "Completed"
      }), jsx("div", {
        children: description
      }), jsx("div", {
        children: children
      }), isCompleted && nextStepButton && jsxs("div", {
        css: /*#__PURE__*/css({
          marginTop: tutorialDescriptionItemMargin
        }, process.env.NODE_ENV === "production" ? "" : ";label:LegacyTutorialPage;"),
        children: [jsx(TutorialSubtitle, {
          children: jsx(FormattedMessage, {
            id: "daKGDx",
            defaultMessage: "Next step..."
          })
        }), jsx("div", {
          children: nextStepButton
        })]
      })]
    })]
  });
}
/**
 * @deprecated
 */

function TutorialCheckPage(props) {
  var _props$check, _props$check2;

  const {
    skip,
    onboardingChecks
  } = useOnboardingController();
  const onSkipClick = useCallbackWithOnboardingEventRecorder(skip, OnboardingAction.TutorialAbandon);
  const check = props.check || (props.checkName ? onboardingChecks[props.checkName] : undefined);
  const shouldShowMarkAsDone = props.showDismiss || !((_props$check = props.check) !== null && _props$check !== void 0 && _props$check.isCompleted);
  return jsx(LegacyTutorialPage, { ...props,
    isCompleted: check === null || check === void 0 ? void 0 : check.isCompleted,
    skipButton: shouldShowMarkAsDone && jsx(Button, {
      type: "link",
      css: skipButtonStyle,
      block: true,
      onClick: !props.showDismiss ? (_props$check2 = props.check) === null || _props$check2 === void 0 ? void 0 : _props$check2.markAsDone : onSkipClick,
      children: props.showDismiss ? jsx(FormattedMessage, {
        id: "qwK/Zv",
        defaultMessage: "Don't show again"
      }) : jsx(FormattedMessage, {
        id: "9O5Td8",
        defaultMessage: "Mark as done"
      })
    })
  });
}

var _ref = process.env.NODE_ENV === "production" ? {
  name: "1lh7kdz",
  styles: "flex-grow:1;display:flex;flex-direction:column"
} : {
  name: "4tjv8j-containerStyles",
  styles: "flex-grow:1;display:flex;flex-direction:column;label:containerStyles;",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__
};

function TutorialPage(_ref3) {
  var _tutorialTasks$tasksM, _nextTask$title;

  let {
    tutorialTaskKey,
    title,
    description,
    canGoBack = false,
    completedText,
    nextTask,
    children
  } = _ref3;
  const {
    theme
  } = useDesignSystemTheme();
  const {
    popPage
  } = useTutorialRoute();
  const {
    tutorialTasks
  } = useTutorialContext();
  const taskStatus = (_tutorialTasks$tasksM = tutorialTasks.tasksMap[tutorialTaskKey !== null && tutorialTaskKey !== void 0 ? tutorialTaskKey : '']) === null || _tutorialTasks$tasksM === void 0 ? void 0 : _tutorialTasks$tasksM.useTutorialTaskStatus();
  const containerStyles = _ref;
  const headerRowStyles = /*#__PURE__*/css("padding:", theme.spacing.md, "px 56px 56px ", theme.spacing.lg, "px;display:flex;align-items:center;" + (process.env.NODE_ENV === "production" ? "" : ";label:headerRowStyles;"));
  const contentStyles = /*#__PURE__*/css("flex-grow:1;padding:0 ", theme.spacing.lg, "px 32px ", theme.spacing.lg, "px;p{color:", theme.colors.textPrimary, ";margin-bottom:", theme.spacing.lg, "px;}" + (process.env.NODE_ENV === "production" ? "" : ";label:contentStyles;"));
  return jsxs("div", {
    css: containerStyles,
    children: [jsxs("section", {
      css: headerRowStyles,
      children: [canGoBack && jsx(Button, {
        css: /*#__PURE__*/css({
          marginRight: theme.spacing.sm
        }, process.env.NODE_ENV === "production" ? "" : ";label:TutorialPage;"),
        icon: jsx(ArrowLeftIcon, {}),
        onClick: popPage
      }), jsx(Header, {
        title: title
      })]
    }), jsxs("section", {
      css: contentStyles,
      children: [(taskStatus === null || taskStatus === void 0 ? void 0 : taskStatus.isCompleted) && jsxs("div", {
        css: /*#__PURE__*/css({
          display: 'flex',
          alignItems: 'center',
          background: theme.colors.backgroundValidationSuccess,
          color: theme.colors.textValidationSuccess,
          padding: "".concat(theme.spacing.sm, "px ").concat(theme.spacing.md, "px"),
          border: "1px solid ".concat(theme.colors.green400),
          borderRadius: theme.general.borderRadiusBase,
          marginBottom: theme.spacing.lg
        }, process.env.NODE_ENV === "production" ? "" : ";label:TutorialPage;"),
        role: "status",
        "aria-label": "completed",
        children: [jsx(CheckCircleFillIcon, {
          css: /*#__PURE__*/css({
            marginRight: theme.spacing.sm
          }, process.env.NODE_ENV === "production" ? "" : ";label:TutorialPage;")
        }), " ", completedText !== null && completedText !== void 0 ? completedText : 'Completed']
      }), jsx("div", {
        children: description
      }), jsx("div", {
        children: children
      }), nextTask && jsxs("div", {
        css: /*#__PURE__*/css({
          marginTop: theme.spacing.lg
        }, process.env.NODE_ENV === "production" ? "" : ";label:TutorialPage;"),
        children: [jsx(TutorialSubtitle, {
          children: (_nextTask$title = nextTask.title) !== null && _nextTask$title !== void 0 ? _nextTask$title : 'Next step...'
        }), nextTask.taskButton]
      })]
    })]
  });
}

function TutorialHomePage(_ref) {
  let {
    title,
    description,
    userSubtitle
  } = _ref;
  const {
    onboardingChecks
  } = useOnboardingController();
  const buttons = Object.keys(onboardingChecks).map(step => {
    const currentStep = onboardingChecks[step];
    return currentStep.button;
  });
  return jsx(TutorialCheckPage, {
    hasBack: false,
    check: undefined,
    showDismiss: true,
    title: title,
    description: description,
    children: jsx("div", {
      "data-testid": "TutorialHomePage.Content",
      children: jsxs("div", {
        style: {
          marginTop: adminOnboardingButtonContainerVerticalSpacing
        },
        children: [jsx(TutorialSubtitle, {
          children: userSubtitle
        }), buttons]
      })
    })
  });
}

const Steps = {
  RunFirstQuery: 'runFirstQuery',
  ExploreAvailableData: 'exploreAvailableData',
  ImportSampleDashboard: 'importSampleDashboard'
};

const dataIcon = jsx(DataIcon, {});

function TutorialExploreDataPage(props) {
  const exploreAvailableDataCheck = useOnboardingCheck(Steps.ExploreAvailableData);
  return jsx(TutorialCheckPage, {
    title: jsx(FormattedMessage, {
      id: "eXcFQZ",
      defaultMessage: "Explore available data"
    }),
    check: exploreAvailableDataCheck,
    description: jsx(FormattedMessage, {
      id: "KNKvrD",
      defaultMessage: "<p>The data explorer (<strong>{dataIcon} Data</strong> in the Databricks SQL sidebar) lets you easily explore and manage permissions on databases and tables. You can view schema details, preview sample data, and see table details and properties. Additionally, administrators can view and change owners, as well as grant and revoke permissions.</p>",
      values: {
        dataIcon
      }
    }),
    children: jsx("div", {})
  });
}

jsx(DataIcon, {});

function TutorialImportSampleDashboardPage(props) {
  const importSampleDashboardCheck = useOnboardingCheck(Steps.ImportSampleDashboard);
  return jsx(TutorialCheckPage, {
    title: jsx(FormattedMessage, {
      id: "lgdNIH",
      defaultMessage: "Import sample dashboard"
    }),
    check: importSampleDashboardCheck,
    description: jsx(FormattedMessage, {
      id: "OEbP7w",
      defaultMessage: " <p>You can discover insights from your query results with a wide variety of rich visualizations. Databricks SQL allows you to organize visualizations into dashboards with an intuitive drag-and-drop interface. You can then share your dashboards with others, both within and outside your organization, without the need to grant viewers direct access to the underlying data. To keep everyone current, you can configure dashboards to automatically refresh, as well as to alert viewers to meaningful changes in the data.</p> <p>A dashboard gallery is available to help you get started.</p>"
    }),
    nextStepButton: props.nextButton,
    children: jsx("div", {})
  });
}

function TutorialRunYourFirstQueryPage(props) {
  const runFirstQueryCheck = useOnboardingCheck(Steps.RunFirstQuery);
  return jsx(TutorialCheckPage, {
    title: jsx(FormattedMessage, {
      id: "T0OFn1",
      defaultMessage: "Run your first query"
    }),
    check: runFirstQueryCheck,
    description: jsx(FormattedMessage, {
      id: "bNPwy8",
      defaultMessage: "<p>Databricks SQL features a fast, full-featured SQL editor for writing queries and sharing visualizations and dashboards with your team. A sample dataset is available. Try running your first query now.</p>"
    }),
    nextStepButton: props.nextButton,
    children: jsx("div", {})
  });
}

function useUserOnboardingChecks(skip) {
  const {
    withOnboardingEventRecorder
  } = useOnboardingRecorders();
  const resetChecks = useResetCachedOnboardingChecks();
  const cachedHasRunFirstQuery = useCachedOnboardingCheck(Steps.RunFirstQuery);
  const cachedHasExploredAvailableData = useCachedOnboardingCheck(Steps.ExploreAvailableData);
  const cachedHasImportedSampleDashboard = useCachedOnboardingCheck(Steps.ImportSampleDashboard);
  const importSampleDashboard = {
    isChecking: false,
    isCompleted: cachedHasImportedSampleDashboard,
    button: jsx(AutoTutorialButton, {
      title: "Import sample dashboard",
      checkName: Steps.ImportSampleDashboard,
      eventName: "importSampleDashboard",
      href: "dashboards/samples",
      icon: jsx(DashboardIcon, {}),
      variant: "user",
      targetPage: () => jsx(TutorialImportSampleDashboardPage, {})
    }),
    markAsDone: cachedHasImportedSampleDashboard ? _noop : withOnboardingEventRecorder(() => {}, OnboardingAction.MarkAsDone, Steps.ImportSampleDashboard)
  };
  const exploreAvailableData = {
    isChecking: false,
    isCompleted: cachedHasExploredAvailableData,
    button: jsx(AutoTutorialButton, {
      title: "Explore available data",
      eventName: "exploreAvailableData",
      checkName: Steps.ExploreAvailableData,
      variant: "user",
      href: "data",
      icon: jsx(DataIcon, {}),
      targetPage: () => jsx(TutorialExploreDataPage, {
        nextButton: importSampleDashboard.button
      })
    }),
    markAsDone: cachedHasExploredAvailableData ? _noop : withOnboardingEventRecorder(() => {}, OnboardingAction.MarkAsDone, Steps.ExploreAvailableData)
  };
  const runFirstQuery = {
    isChecking: false,
    isCompleted: cachedHasRunFirstQuery,
    button: jsx(AutoTutorialButton, {
      title: "Run your first query",
      eventName: "runFirstQuery",
      checkName: Steps.RunFirstQuery,
      variant: "user",
      href: "queries/new?sample=tutorialYourFirstQuery",
      icon: jsx(QueryNavIcon, {}),
      targetPage: () => jsx(TutorialRunYourFirstQueryPage, {
        nextButton: exploreAvailableData.button
      })
    }),
    markAsDone: cachedHasRunFirstQuery ? _noop : withOnboardingEventRecorder(() => {}, OnboardingAction.MarkAsDone, Steps.RunFirstQuery)
  };
  const allChecks = [runFirstQuery, exploreAvailableData, importSampleDashboard];
  const checksTodo = allChecks.filter(check => !check.isCompleted).length;
  const mapChecks = {
    [Steps.RunFirstQuery]: runFirstQuery,
    [Steps.ExploreAvailableData]: exploreAvailableData,
    [Steps.ImportSampleDashboard]: importSampleDashboard
  };
  return {
    checksTodo,
    isChecking: false,
    checks: mapChecks,

    reset() {
      resetChecks(Steps.RunFirstQuery, Steps.ExploreAvailableData, Steps.ImportSampleDashboard);
    }

  };
}

export { AutoTutorialButton, LegacyTutorialButton, LegacyTutorialPage, OnboardingAction, OnboardingConfigProvider, OnboardingContextProvider, Steps, TutorialButton, TutorialCheckPage, TutorialHomePage, TutorialPage, TutorialProvider, TutorialRouterContext, TutorialRoutes, TutorialSidebar, TutorialSubtitle, TutorialTasks, adminOnboardingButtonContainerVerticalSpacing, antdDefaultSizeButtonVerticalPadding, duboisFonts, tutorialButtonDimensions, tutorialDescriptionItemMargin, tutorialPanelDimensions, tutorialTaskStatusChanged, tutorialVisibilityChanged, useCacheCompletedOnboardingCheckEffect, useCachedOnboardingCheck, useCallbackWithOnboardingEventRecorder, useOnboardingCheck, useOnboardingConfig, useOnboardingController, useOnboardingEnabled, useOnboardingRecorders, useOnboardingSkip, useOnboardingStorage, useOnboardingStyles, useRecordOnboardingCheckCompletedEvent, useResetCachedOnboardingChecks, useTutorialContext, useTutorialRoute, useTutorialRouter, useUserOnboardingChecks };
//# sourceMappingURL=onboarding.js.map
