import React from 'react';
import { shallow } from 'enzyme';
import { PendingRequestsTable } from './PendingRequestsTable';
import { mockGetFieldValue, mockTransitionRequest } from '../test-utils';
import { ActivityTypes, Stages, ActivityActions } from '../constants';
import { TransitionRequestForm } from './TransitionRequestForm';
import { mountWithIntl } from '../../common/utils/TestUtils';

describe('PendingRequestsTable', () => {
  let wrapper;
  let minimalProps;

  beforeEach(() => {
    minimalProps = {
      currentStage: Stages.NONE,
      pendingRequests: [mockTransitionRequest(ActivityTypes.REQUESTED_TRANSITION, Stages.STAGING)],
      onPendingRequestTransition: jest.fn(),
    };
  });

  const createState = (action, toStage) => {
    return {
      confirmModalVisible: true,
      confirmingRequest: {
        to_stage: toStage,
      },
      confirmingRequestAction: action,
    };
  };

  test('should render with minimal props without exploding', () => {
    wrapper = shallow(<PendingRequestsTable {...minimalProps} />);
    expect(wrapper.length).toBe(1);
  });

  describe('transition action activities', () => {
    test('all available actions', () => {
      const allActions = [
        ActivityActions.APPROVE_TRANSITION_REQUEST,
        ActivityActions.REJECT_TRANSITION_REQUEST,
        ActivityActions.CANCEL_TRANSITION_REQUEST,
      ];
      const props = {
        ...minimalProps,
        pendingRequests: [
          mockTransitionRequest(ActivityTypes.REQUESTED_TRANSITION, Stages.PRODUCTION, allActions),
        ],
      };
      wrapper = mountWithIntl(<PendingRequestsTable {...props} />);
      expect(wrapper.html()).toContain('Reject');
      expect(wrapper.html()).toContain('Approve');
      expect(wrapper.html()).toContain('Cancel');
    });

    test('approve/reject actions', () => {
      const approveRejectActions = [
        ActivityActions.APPROVE_TRANSITION_REQUEST,
        ActivityActions.REJECT_TRANSITION_REQUEST,
      ];
      const props = {
        ...minimalProps,
        pendingRequests: [
          mockTransitionRequest(
            ActivityTypes.REQUESTED_TRANSITION,
            Stages.PRODUCTION,
            approveRejectActions,
          ),
        ],
      };
      wrapper = mountWithIntl(<PendingRequestsTable {...props} />);
      expect(wrapper.html()).toContain('Reject');
      expect(wrapper.html()).toContain('Approve');
      expect(wrapper.html()).not.toContain('Cancel');
    });

    test('owner actions', () => {
      const ownerActions = [ActivityActions.CANCEL_TRANSITION_REQUEST];
      const props = {
        ...minimalProps,
        pendingRequests: [
          mockTransitionRequest(
            ActivityTypes.REQUESTED_TRANSITION,
            Stages.PRODUCTION,
            ownerActions,
          ),
        ],
      };
      wrapper = mountWithIntl(<PendingRequestsTable {...props} />);
      expect(wrapper.html()).not.toContain('Reject');
      expect(wrapper.html()).not.toContain('Approve');
      expect(wrapper.html()).toContain('Cancel');
    });

    test('no actions', () => {
      const props = {
        ...minimalProps,
        pendingRequests: [
          mockTransitionRequest(ActivityTypes.REQUESTED_TRANSITION, Stages.PRODUCTION, []),
        ],
      };
      wrapper = mountWithIntl(<PendingRequestsTable {...props} />);
      expect(wrapper.html()).not.toContain('Reject');
      expect(wrapper.html()).not.toContain('Approve');
      expect(wrapper.html()).not.toContain('Cancel');
    });

    test('renderConfirmModal passes isApproval and toStage to TransitionRequestform', () => {
      const props = { ...minimalProps };
      wrapper = shallow(<PendingRequestsTable {...props} />);
      wrapper
        .instance()
        .setState(createState(ActivityActions.APPROVE_TRANSITION_REQUEST, Stages.STAGING));
      expect(wrapper.find(TransitionRequestForm).props().toStage).toBe(Stages.STAGING);
      expect(wrapper.find(TransitionRequestForm).props().isApproval).toBe(true);

      wrapper
        .instance()
        .setState(createState(ActivityActions.REJECT_TRANSITION_REQUEST, Stages.PRODUCTION));
      expect(wrapper.find(TransitionRequestForm).props().toStage).toBe(Stages.PRODUCTION);
      expect(wrapper.find(TransitionRequestForm).props().isApproval).toBe(false);

      wrapper
        .instance()
        .setState(createState(ActivityActions.CANCEL_TRANSITION_REQUEST, Stages.NONE));
      expect(wrapper.find(TransitionRequestForm).props().toStage).toBe(Stages.NONE);
      expect(wrapper.find(TransitionRequestForm).props().isApproval).toBe(false);
    });

    test('handleConfirmModalConfirm - APPROVE_TRANSITION - archiveExistingVersions', () => {
      const mockOnPendingRequestApproval = jest.fn();
      const props = { ...minimalProps, onPendingRequestApproval: mockOnPendingRequestApproval };
      wrapper = shallow(<PendingRequestsTable {...props} />);
      wrapper.setState({
        confirmingRequest: '',
        confirmingRequestAction: ActivityActions.APPROVE_TRANSITION_REQUEST,
      });
      const comment = 'comment';
      const mockArchiveFieldValues = [true, false, undefined];
      mockArchiveFieldValues.forEach((fieldValue) => {
        const expectedArchiveFieldValue = Boolean(fieldValue);
        const instance = wrapper.instance();
        instance.transitionFormRef = {
          current: {
            getFieldValue: mockGetFieldValue(comment, fieldValue),
            resetFields: () => {},
          },
        };
        instance.handleConfirmModalConfirm();

        expect(mockOnPendingRequestApproval).toHaveBeenCalledWith(
          '',
          comment,
          expectedArchiveFieldValue,
        );
      });
    });
  });
});
