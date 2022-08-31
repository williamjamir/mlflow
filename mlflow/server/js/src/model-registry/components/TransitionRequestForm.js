import { Checkbox, Input, Tooltip, Form } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';
import {
  ACTIVE_STAGES,
  archiveExistingVersionToolTipText,
  Stages,
  StageTagComponents,
} from '../constants';
import { FormattedMessage, injectIntl } from 'react-intl';

const { TextArea } = Input;
export class TransitionRequestFormImpl extends React.Component {
  static propTypes = {
    innerRef: PropTypes.object,
    toStage: PropTypes.string,
    isApproval: PropTypes.bool,
    intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
  };

  render() {
    const { toStage, isApproval, innerRef, intl } = this.props;

    return (
      <Form ref={innerRef} className='transition-request-form'>
        <Form.Item
          label={intl.formatMessage({
            defaultMessage: 'Comment',
            description:
              'Title text for transition request form to add comments for model' +
              ' version stage transition request',
          })}
          name='comment'
        >
          <TextArea
            rows={4}
            placeholder={intl.formatMessage({
              defaultMessage: 'Comment',
              description:
                'Placeholder text for transition request form to add comments' +
                ' for model version stage transition request',
            })}
          />
        </Form.Item>
        {toStage && isApproval && ACTIVE_STAGES.includes(toStage) && (
          <Form.Item
            name='archiveExistingVersions'
            initialValue='true'
            valuePropName='checked'
            preserve={false}
          >
            <Checkbox>
              <Tooltip title={archiveExistingVersionToolTipText(toStage)}>
                <FormattedMessage
                  // eslint-disable-next-line max-len
                  defaultMessage='Transition existing {currentStage} model version to {archivedStage}'
                  description='Description text for checkbox for archiving existing model versions
                  in the toStage for model version stage transition request'
                  values={{
                    currentStage: StageTagComponents[toStage],
                    archivedStage: StageTagComponents[Stages.ARCHIVED],
                  }}
                />
                &nbsp;
              </Tooltip>
            </Checkbox>
          </Form.Item>
        )}
      </Form>
    );
  }
}

export const TransitionRequestForm = injectIntl(TransitionRequestFormImpl);
