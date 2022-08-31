import {
  InteractionType,
  ReactInteractionTracing,
  startInteraction,
  notifyOnInteractionComplete,
} from '@databricks/web-shared-bundle/metrics';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router';
import { getMlflowInteractionName } from '../../shared/route-interactions';
import { UniverseFrontendApis } from '../utils/UniverseFrontendApis';

/**
 * A pseudo-factory method that returns the INITIAL_LOAD interaction and assigns
 * the name basing on the active hash-router based route
 */
const getInitialLoadInteraction = () => {
  /**
   * The MLFlow internal route.
   */
  const currentMlflowUrl = window.location.hash.substring(1);

  /**
   * We need to strip out query params, otherwise react-router won't
   * detect the current pathname correctly.
   */
  const currentMlflowPathname = currentMlflowUrl.split('?')[0];

  const name = getMlflowInteractionName(currentMlflowPathname);
  return startInteraction(InteractionType.INITIAL_LOAD, name, undefined, 0);
};

/**
 * A react component that listens to the changes in the history and
 * registers proper navigation interactions, then assigns them to the
 * overarching context.
 */
const InteractionHistoryListener = ({ children, setInteraction }) => {
  const history = useHistory();
  useEffect(() => {
    const unregister = history.listen((location) => {
      const interactionName = getMlflowInteractionName(location.pathname);
      const interaction = startInteraction(InteractionType.NAVIGATION, interactionName);
      setInteraction(interaction);
    });
    return unregister;
  }, [setInteraction, history]);

  return children;
};

/**
 * A main react component that hooks up the interaction tracking system for all the
 * routes in the application. Provides the context and keeps the track of navigation changes.
 */
export const MlflowInteractionTracker = ({ children }) => {
  const [currentInteraction, setCurrentInteraction] = useState(() => getInitialLoadInteraction());

  useEffect(() => {
    return notifyOnInteractionComplete((completedInteraction) => {
      UniverseFrontendApis.interactionEvent({
        interaction: completedInteraction,
      });
    });
  }, []);

  return (
    <ReactInteractionTracing enabled interaction={currentInteraction}>
      <InteractionHistoryListener setInteraction={setCurrentInteraction}>
        {children}
      </InteractionHistoryListener>
    </ReactInteractionTracing>
  );
};

MlflowInteractionTracker.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
