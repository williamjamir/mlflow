import React from 'react';
import { shallow } from 'enzyme';
import { ModelActivitiesList, ModelActivitiesListImpl } from './ModelActivitiesList';
import { mockActivity } from '../test-utils';
import { ActivityActions, ActivityTypes, Stages } from '../constants';
import { Steps } from 'antd';
import { mountWithIntl } from '../../common/utils/TestUtils';

const MILLIS_PER_DAY = 86400000;

describe('ModelActivitiesList', () => {
  let wrapper;
  let minimalProps;

  beforeEach(() => {
    minimalProps = {
      activities: [mockActivity(ActivityTypes.REQUESTED_TRANSITION, Stages.NONE, Stages.STAGING)],
      onCreateComment: jest.fn(),
      onEditComment: jest.fn(),
      onDeleteComment: jest.fn(),
    };
  });

  test('should render with minimal props without exploding', () => {
    wrapper = mountWithIntl(<ModelActivitiesList {...minimalProps} />);
    expect(wrapper.length).toBe(1);
  });

  test('should sort activities by timestamp', () => {
    const earlierTime = new Date().getTime() - 10000;
    const props = {
      ...minimalProps,
      activities: [
        mockActivity(ActivityTypes.REQUESTED_TRANSITION, Stages.NONE, Stages.STAGING),
        mockActivity(ActivityTypes.APPLIED_TRANSITION, Stages.NONE, Stages.ARCHIVED, earlierTime),
      ],
    };
    wrapper = mountWithIntl(<ModelActivitiesList {...props} />);
    const steps = wrapper.find(Steps.Step);
    expect(steps.first().html()).toContain('applied');
    expect(steps.at(steps.length - 2).html()).toContain('requested');
  });

  test('activity title should contain relevant information for a REQUESTED_TRANSITION', () => {
    const fourDaysAgo = new Date();
    fourDaysAgo.setTime(fourDaysAgo.getTime() - 4 * MILLIS_PER_DAY);
    const activity = mockActivity(
      ActivityTypes.REQUESTED_TRANSITION,
      Stages.NONE,
      Stages.STAGING,
      fourDaysAgo.getTime(),
    );
    const activityTitleHtml = mountWithIntl(
      wrapper.find(ModelActivitiesListImpl).instance().getTitle(activity),
    ).html();

    expect(activityTitleHtml).toContain('requested a stage transition');
    expect(activityTitleHtml).toContain('None');
    expect(activityTitleHtml).toContain('Staging');
    expect(activityTitleHtml).toContain('4 days ago');
  });

  test('activity title should contain relevant information for a CANCELLED_REQUEST', () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setTime(sevenDaysAgo.getTime() - 7 * MILLIS_PER_DAY);
    const activity = mockActivity(
      ActivityTypes.CANCELLED_REQUEST,
      Stages.NONE,
      Stages.STAGING,
      sevenDaysAgo.getTime(),
    );
    const activityTitleHtml = mountWithIntl(
      wrapper.find(ModelActivitiesListImpl).instance().getTitle(activity),
    ).html();

    expect(activityTitleHtml).toContain('cancelled their stage transition request');
    expect(activityTitleHtml).toContain('None');
    expect(activityTitleHtml).toContain('Staging');
    expect(activityTitleHtml).toContain('7 days ago');
  });

  test('activity title should contain relevant information for an APPROVED_REQUEST', () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setTime(twoWeeksAgo.getTime() - 14 * MILLIS_PER_DAY);
    const activity = mockActivity(
      ActivityTypes.APPROVED_REQUEST,
      Stages.NONE,
      Stages.STAGING,
      twoWeeksAgo.getTime(),
    );
    const activityTitleHtml = mountWithIntl(
      wrapper.find(ModelActivitiesListImpl).instance().getTitle(activity),
    ).html();

    expect(activityTitleHtml).toContain('approved a stage transition');
    expect(activityTitleHtml).toContain('None');
    expect(activityTitleHtml).toContain('Staging');
    expect(activityTitleHtml).toContain('14 days ago');
  });

  test('activity title should contain relevant information for a REJECTED_REQUEST', () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setTime(thirtyDaysAgo.getTime() - 30 * MILLIS_PER_DAY);
    const activity = mockActivity(
      ActivityTypes.REJECTED_REQUEST,
      Stages.NONE,
      Stages.STAGING,
      thirtyDaysAgo.getTime(),
    );
    const activityTitleHtml = mountWithIntl(
      wrapper.find(ModelActivitiesListImpl).instance().getTitle(activity),
    ).html();

    expect(activityTitleHtml).toContain('rejected a stage transition');
    expect(activityTitleHtml).toContain('None');
    expect(activityTitleHtml).toContain('Staging');
    expect(activityTitleHtml).toContain('1 month ago');
  });

  test('activity title should contain relevant information for an APPLIED_TRANSITION', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setTime(threeDaysAgo.getTime() - 3 * MILLIS_PER_DAY);
    const systemComment = '2 other versions were transitioned to Archived';
    const activity = mockActivity(
      ActivityTypes.APPLIED_TRANSITION,
      Stages.STAGING,
      Stages.ARCHIVED,
      threeDaysAgo.getTime(),
      systemComment,
    );
    const activityTitleHtml = mountWithIntl(
      wrapper.find(ModelActivitiesListImpl).instance().getTitle(activity),
    ).html();

    expect(activityTitleHtml).toContain('applied a stage transition');
    expect(activityTitleHtml).toContain('Archived');
    expect(activityTitleHtml).toContain('Staging');
    expect(activityTitleHtml).toContain(`(${systemComment})`);
    expect(activityTitleHtml).toContain('3 days ago');
  });

  test('activity title should contain relevant information for a SYSTEM_TRANSITION', () => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setTime(sixtyDaysAgo.getTime() - 60 * MILLIS_PER_DAY);
    const systemComment = 'Version 3 was transitioned to Production';
    const activity = mockActivity(
      ActivityTypes.SYSTEM_TRANSITION,
      Stages.PRODUCTION,
      Stages.ARCHIVED,
      sixtyDaysAgo.getTime(),
      systemComment,
    );
    const activityTitleHtml = mountWithIntl(
      wrapper.find(ModelActivitiesListImpl).instance().getTitle(activity),
    ).html();

    expect(activityTitleHtml).toContain('was transitioned from');
    expect(activityTitleHtml).toContain('Production');
    expect(activityTitleHtml).toContain('Archived');
    expect(activityTitleHtml).toContain('when ' + systemComment);
    expect(activityTitleHtml).toContain('2 months ago');
  });

  test('comment title/description should contain username and time', () => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setTime(sixtyDaysAgo.getTime() - 60 * MILLIS_PER_DAY);
    const activity = mockActivity(
      ActivityTypes.NEW_COMMENT,
      undefined,
      undefined,
      sixtyDaysAgo.getTime(),
      '',
      'Some comment that I thought of!',
    );

    const activityTitleHtml = mountWithIntl(
      wrapper.find(ModelActivitiesListImpl).instance().getTitle(activity),
    ).html();

    expect(activityTitleHtml).toContain('richard@example.com');
    expect(activityTitleHtml).toContain('2 months ago');
    expect(activityTitleHtml).not.toContain('Some comment that I thought of!');

    const activityDescriptionHtml = mountWithIntl(
      wrapper.find(ModelActivitiesListImpl).instance().getDescription(activity),
    ).html();

    expect(activityDescriptionHtml).toContain('Some comment that I thought of!');
  });

  test('last item in activity list should be add comment step', () => {
    const earlierTime = new Date().getTime() - 10000;
    const props = {
      ...minimalProps,
      activities: [
        mockActivity(ActivityTypes.REQUESTED_TRANSITION, Stages.NONE, Stages.STAGING),
        mockActivity(ActivityTypes.APPLIED_TRANSITION, Stages.NONE, Stages.ARCHIVED, earlierTime),
      ],
    };
    wrapper = mountWithIntl(<ModelActivitiesList {...props} />);
    const steps = wrapper.find(Steps.Step);
    expect(steps.last().html()).toContain('Add a comment');
  });

  test('test edit/delete controls show only when available', () => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setTime(sixtyDaysAgo.getTime() - 60 * MILLIS_PER_DAY);
    const activity = mockActivity(
      ActivityTypes.NEW_COMMENT,
      undefined,
      undefined,
      sixtyDaysAgo.getTime(),
      '',
      'Some comment that I thought of!',
      [ActivityActions.EDIT_COMMENT],
    );
    const activityList = mountWithIntl(
      <ModelActivitiesList {...minimalProps} activities={[activity]} />,
    );
    const controlState = {};
    controlState[activity.id] = true;
    const instance = activityList.find(ModelActivitiesListImpl).instance();
    instance.setState({ showControls: controlState });
    const editBtn = shallow(instance.getTitle(activity)).find('.edit-btn');
    expect(editBtn.length).toBe(1);
    const deleteBtn = shallow(instance.getTitle(activity)).find('.delete-btn');
    expect(deleteBtn.length).toBe(0);

    const activity2 = mockActivity(
      ActivityTypes.NEW_COMMENT,
      undefined,
      undefined,
      sixtyDaysAgo.getTime(),
      '',
      'Some comment that I thought of!',
      [ActivityActions.EDIT_COMMENT, ActivityActions.DELETE_COMMENT],
    );

    const activityList2 = mountWithIntl(
      <ModelActivitiesList {...minimalProps} activities={[activity2]} />,
    );
    const instance2 = activityList2.find(ModelActivitiesListImpl).instance();
    instance2.setState({ showControls: controlState });
    const editBtn2 = shallow(instance2.getTitle(activity2)).find('.edit-btn');
    expect(editBtn2.length).toBe(1);
    const deleteBtn2 = shallow(instance2.getTitle(activity2)).find('.delete-btn');
    expect(deleteBtn2.length).toBe(1);

    const activity3 = mockActivity(
      ActivityTypes.NEW_COMMENT,
      undefined,
      undefined,
      sixtyDaysAgo.getTime(),
      '',
      'Some comment that I thought of!',
      [ActivityActions.DELETE_COMMENT],
    );

    const activityList3 = mountWithIntl(
      <ModelActivitiesList {...minimalProps} activities={[activity3]} />,
    );
    const instance3 = activityList3.find(ModelActivitiesListImpl).instance();
    instance3.setState({ showControls: controlState });
    const editBtn3 = shallow(instance3.getTitle(activity3)).find('.edit-btn');
    expect(editBtn3.length).toBe(0);
    const deleteBtn3 = shallow(instance3.getTitle(activity3)).find('.delete-btn');
    expect(deleteBtn3.length).toBe(1);

    const activity4 = mockActivity(
      ActivityTypes.NEW_COMMENT,
      undefined,
      undefined,
      sixtyDaysAgo.getTime(),
      '',
      'Some comment that I thought of!',
      [],
    );

    const activityList4 = mountWithIntl(
      <ModelActivitiesList {...minimalProps} activities={[activity3]} />,
    );
    const instance4 = activityList4.find(ModelActivitiesListImpl).instance();
    instance4.setState({ showControls: controlState });
    const editBtn4 = shallow(instance4.getTitle(activity4)).find('.edit-btn');
    expect(editBtn4.length).toBe(0);
    const deleteBtn4 = shallow(instance4.getTitle(activity4)).find('.delete-btn');
    expect(deleteBtn4.length).toBe(0);
  });
});
