import { Checkbox, Tooltip, Form } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';
import {
  ACTIVE_STAGES,
  archiveExistingVersionToolTipText,
  Stages,
  StageTagComponents,
} from '../constants';
import { FormattedMessage, injectIntl } from 'react-intl';
// BEGIN-EDGE
import { Input } from 'antd';

const { TextArea } = Input;
// END-EDGE

export class DirectTransitionFormImpl extends React.Component {
  static propTypes = {
    innerRef: PropTypes.object,
    toStage: PropTypes.string,
    intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
  };

  render() {
    const { toStage, innerRef } = this.props;

    return (
      <Form ref={innerRef} className='model-version-update-form'>
        {/* BEGIN-EDGE */}
        <Form.Item
          label={this.props.intl.formatMessage({
            defaultMessage: 'Comment',
            description:
              'Title text for stage transition form to add comments for model version' +
              ' stage transitions',
          })}
          name='comment'
        >
          <TextArea
            rows={4}
            placeholder={this.props.intl.formatMessage({
              defaultMessage: 'Comment',
              description:
                'Placeholder text for stage transition form to add comments for model version' +
                ' stage transitions',
            })}
          />
        </Form.Item>
        {/* END-EDGE */}
        {/* prettier-ignore */}
        {toStage && ACTIVE_STAGES.includes(toStage) && (
          <Form.Item
            name='archiveExistingVersions'
            initialValue='true'
            valuePropName='checked'
            preserve={false}
          >
            <Checkbox>
              <Tooltip title={archiveExistingVersionToolTipText(toStage)}>
                <FormattedMessage
                  defaultMessage='Transition existing {currentStage} model versions to
                    {archivedStage}'
                  description='Description text for checkbox for archiving existing model versions
                    in the toStage for model version stage transition'
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

export const DirectTransitionForm = injectIntl(DirectTransitionFormImpl);
