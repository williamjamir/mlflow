import React from 'react';
import '../experiment-tracking/components/App.css';
import { HashRouter as Router, Redirect, Route } from 'react-router-dom';
import { PageNotFoundView } from '../experiment-tracking/components/PageNotFoundView';
import { Switch } from 'react-router';
import { FeatureStoreRoutes } from './routes';
import { FeatureStorePage } from './components/FeatureStorePage';
import { FeatureTablePage } from './components/FeatureTablePage';
import { OnlineStorePage } from './components/OnlineStorePage';
import { FeaturePage } from './components/FeaturePage';
import ErrorModal from '../experiment-tracking/components/modals/ErrorModal';
import AppErrorBoundary from '../common/components/error-boundaries/AppErrorBoundary';
import { MlflowInteractionTracker as InteractionTracker } from '../common/components/MlflowInteractionTracker';

export const FeatureStoreApp = () => {
  return (
    <Router>
      <ErrorModal />
      <AppErrorBoundary service='feature-store'>
        <InteractionTracker>
          <Switch>
            <Route exact path={FeatureStoreRoutes.BASE} component={FeatureStorePage} />
            <Route exact path={FeatureStoreRoutes.TABLE_DETAIL} component={FeatureTablePage} />
            <Route exact path={FeatureStoreRoutes.ONLINE_STORE} component={OnlineStorePage} />
            <Route exact path={FeatureStoreRoutes.FEATURE_PAGE} component={FeaturePage} />
            <Redirect from={FeatureStoreRoutes.ROOT} to={FeatureStoreRoutes.BASE} />
            <Route component={PageNotFoundView} />
          </Switch>
        </InteractionTracker>
      </AppErrorBoundary>
    </Router>
  );
};
