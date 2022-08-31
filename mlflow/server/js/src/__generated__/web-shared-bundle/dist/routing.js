import React, { Suspense } from 'react';
import { unstable_HistoryRouter } from 'react-router-dom';
import { useRoutes } from 'react-router';
export { useNavigate, useParams } from 'react-router';
import { jsx } from '@emotion/react/jsx-runtime';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';

function LoadingSubstate() {
  return jsx("div", {
    children: "Loading..."
  });
}

function RouteRenderer(_ref) {
  let {
    route
  } = _ref;
  return route.element.read();
}

function transformRoutes(routes) {
  return routes.map(route => ({
    path: route.path,
    element: jsx(Suspense, {
      fallback: jsx(LoadingSubstate, {}),
      children: jsx(RouteRenderer, {
        route: route
      })
    }),
    children: route.children && transformRoutes(route.children)
  }));
}
/**
 * Accepts a list of routes metadata and renders them according to the current location.
 *
 * Usually, this shouldn't be used directly and instead `Router` should be used. It is only
 * useful in the special case, where the router needs to be used together with existing
 * `react-router` instance.
 */


function Routes(_ref2) {
  let {
    routes
  } = _ref2;
  const reactRouterRoutes = transformRoutes(routes); // the useRoutes() hook from `react-router` returns the element, which
  // will correct match and render the routes according to the location

  const reactRoutes = useRoutes(reactRouterRoutes);
  return reactRoutes;
}

function Router(_ref) {
  let {
    history,
    routes
  } = _ref;
  return jsx(unstable_HistoryRouter, {
    history: history,
    children: jsx(Routes, {
      routes: routes
    })
  });
}

class LazyRoute {
  constructor(callback) {
    this.callback = callback;
  }

  async doLoadAndCreateElement() {
    try {
      const RouteComponent = (await this.callback()).RouteComponent;
      this.cachedElement = /*#__PURE__*/React.isValidElement(RouteComponent) ? RouteComponent : /*#__PURE__*/React.createElement(RouteComponent);
      return this.cachedElement;
    } catch (e) {
      if (e instanceof Error) {
        this.error = e;
      }

      throw e;
    }
  }

  load() {
    if (this.pendingPromise) {
      return this.pendingPromise;
    }

    return this.pendingPromise = this.doLoadAndCreateElement();
  }

  read() {
    if (this.cachedElement) {
      return this.cachedElement;
    }

    if (this.error) {
      throw this.error;
    }

    throw this.load();
  }

}

function lazyRoute(callback) {
  return new LazyRoute(callback);
}

async function waitForRoutesToBeRendered() {
  const loadingElement = screen.queryByText('Loading...');
  await waitForElementToBeRemoved(loadingElement);
}

export { Router, Routes, lazyRoute, waitForRoutesToBeRendered };
//# sourceMappingURL=routing.js.map
