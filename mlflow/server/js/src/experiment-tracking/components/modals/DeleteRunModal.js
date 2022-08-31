import React, { Component } from 'react';
import { ConfirmModal } from './ConfirmModal';
import PropTypes from 'prop-types';
import { deleteRunApi, deleteRunDatabricksApi, openErrorModal } from '../../actions';
import { connect } from 'react-redux';
import Utils from '../../../common/utils/Utils';
import { Checkbox } from 'antd';
import DatabricksUtils from '../../../common/utils/DatabricksUtils';
import _ from 'lodash';
import { getRootRunId, isRootRun } from '../../reducers/Reducers';
import { Popover, QuestionMarkFillIcon } from '@databricks/design-system';

export class DeleteRunModalImpl extends Component {
  state = {
    deleteDescendantsBoxChecked: true,
  };

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedRunIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedRootRunsToDescendantRuns: PropTypes.object.isRequired,
    openErrorModal: PropTypes.func.isRequired,
    deleteRunApi: PropTypes.func.isRequired,
    deleteRunDatabricksApi: PropTypes.func.isRequired,
  };

  handleSubmit = () => {
    const { selectedRunIds, selectedRootRunsToDescendantRuns } = this.props;
    const { deleteDescendantsBoxChecked } = this.state;
    const selectedRootRuns = new Set(Object.keys(selectedRootRunsToDescendantRuns));

    let deletePromises = [];
    if (
      DatabricksUtils.isNestedRunDeletionEnabled() &&
      selectedRootRuns.size > 0 &&
      deleteDescendantsBoxChecked
    ) {
      const childRunsUnderSelectedRootRuns = new Set(
        _.flatMap(
          Array.from(selectedRootRuns),
          (rootRunId) => selectedRootRunsToDescendantRuns[rootRunId],
        ),
      );
      deletePromises = selectedRunIds
        // filter out child runs under selected root runs
        .filter((runId) => !childRunsUnderSelectedRootRuns.has(runId))
        .map((runId) =>
          selectedRootRuns.has(runId)
            ? // nested delete for root runs
              this.props.deleteRunDatabricksApi(
                runId,
                selectedRootRunsToDescendantRuns[runId],
                true,
              )
            : // normal delete for other runs
              this.props.deleteRunApi(runId),
        );
    } else {
      deletePromises = selectedRunIds.map((runId) => this.props.deleteRunApi(runId));
    }

    return Promise.all(deletePromises).catch((e) => {
      const maybeErrorMsg = e.getMessageField ? 'Error: ' + e.getMessageField() : '';
      // BEGIN-EDGE
      Utils.propagateErrorToParentFrame({
        error: Error(maybeErrorMsg),
        maybeErrorMsg,
      });
      // END-EDGE
      this.props.openErrorModal(
        'While deleting an experiment run, an error occurred. ' + maybeErrorMsg,
      );
    });
  };

  onChange = (e) => {
    this.setState({
      deleteDescendantsBoxChecked: e.target.checked,
    });
  };

  maybeRenderNestedRunDeletionOption() {
    const { selectedRunIds, selectedRootRunsToDescendantRuns } = this.props;
    const containsRootRun = Object.keys(selectedRootRunsToDescendantRuns).length > 0;
    const runOrRuns = Utils.pluralize('run', selectedRunIds.length);

    const deleteCheckboxHelpTooltipContent = (
      <div className='search-input-tooltip-content'>
        When enabled, the child runs will be deleted together with the parent run.
        <br />
        If disabled, only the selected {runOrRuns} will be deleted, and the child runs will appear
        in the UI without grouping.
      </div>
    );

    if (DatabricksUtils.isNestedRunDeletionEnabled() && containsRootRun) {
      return (
        <p>
          <Checkbox checked={this.state.deleteDescendantsBoxChecked} onChange={this.onChange}>
            Delete all descendant runs of selected {runOrRuns}
          </Checkbox>
          <Popover
            overlayClassName='search-input-tooltip'
            content={deleteCheckboxHelpTooltipContent}
            placement='bottom'
          >
            <QuestionMarkFillIcon className='ExperimentView-search-help' />
          </Popover>
        </p>
      );
    }
    return '';
  }

  render() {
    const number = this.props.selectedRunIds.length;
    return (
      <ConfirmModal
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        handleSubmit={this.handleSubmit}
        title={`Delete Experiment ${Utils.pluralize('Run', number)}`}
        helpText={
          <div>
            <p>
              <b>
                {number} experiment {Utils.pluralize('run', number)} will be deleted.
              </b>
            </p>
            {this.maybeRenderNestedRunDeletionOption()}
            {process.env.SHOW_GDPR_PURGING_MESSAGES === 'true' ? (
              <p>
                Deleted runs are restorable for 30 days, after which they are purged along with
                associated metrics, params, tags, and artifacts.
              </p>
            ) : (
              ''
            )}
          </div>
        }
        confirmButtonText={'Delete'}
      />
    );
  }
}

export function mapStateToProps(state, ownProps) {
  const { selectedRunIds } = ownProps;
  const { tagsByRunUuid } = state.entities;
  const selectedRunIdsSet = new Set(selectedRunIds);

  const selectedRootRunsToDescendantRuns = {};
  // Create an entry for each selected root run
  selectedRunIds.forEach((runId) => {
    if (isRootRun(runId, state)) {
      selectedRootRunsToDescendantRuns[runId] = [];
    }
  });
  // Load all FE aware descendant runs under selected root runs
  Object.keys(tagsByRunUuid).forEach((runId) => {
    const rootRunId = getRootRunId(runId, state);
    const isRootRunSelected = selectedRunIdsSet.has(rootRunId);
    if (!isRootRun(runId, state) && isRootRunSelected) {
      selectedRootRunsToDescendantRuns[rootRunId].push(runId);
    }
  });

  return { selectedRootRunsToDescendantRuns };
}

const mapDispatchToProps = {
  deleteRunApi,
  deleteRunDatabricksApi,
  openErrorModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteRunModalImpl);
