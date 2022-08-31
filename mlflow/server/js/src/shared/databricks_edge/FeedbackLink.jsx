import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';

/**
 * Component that displays a Qualitrics feedback form link.
 */
function FeedbackLink({ link }) {
  const { top } = window.top;
  const shouldDisable = top.settings && top.settings.shouldDisableFeedbackForms;
  if (!shouldDisable) {
    return (
      <a
        href={link}
        target='_blank'
        rel='noopener noreferrer'
        data-testid='feedback-link'
        css={styles.link}
      >
        <FormattedMessage
          defaultMessage='Provide Feedback'
          description='Link to a survey for users to give feedback'
        />
      </a>
    );
  }
  return null;
}
FeedbackLink.propTypes = { link: PropTypes.string.isRequired };

const styles = {
  link: {
    fontSize: 12,
    fontWeight: 500,
    textDecoration: 'none',
    lineHeight: '16px',
  },
};

export { FeedbackLink };
