import QueueLink from 'apollo-link-queue';

// We need this to make sure that these background tabs don't cause load on the server.
// The link has to be constructed dynamically so we can pass in a custom timeout, which
// may only be available once the settings have been initialized.

const makeBackgroundLink = timeoutMs => {
  const link = new QueueLink();
  let offlineTimeout;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Using window.setTimeout to avoid type issues with node vs. browser
      offlineTimeout = window.setTimeout(() => {
        if (document.hidden) {
          link.close();
        }
      }, timeoutMs);
    } else {
      clearTimeout(offlineTimeout);
      link.open();
    }
  }; // We call handleVisibilityChange once on load in case the tab is hidden when it loads.


  handleVisibilityChange();
  document.addEventListener('visibilitychange', handleVisibilityChange, false);
  return link;
};

const offlineLink = new QueueLink();
window.addEventListener('offline', () => offlineLink.close());
window.addEventListener('online', () => offlineLink.open());

export { makeBackgroundLink, offlineLink };
//# sourceMappingURL=graphql.js.map
