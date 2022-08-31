import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { CreateModelPage } from './CreateModelPage';
import { GenericInputModal } from '../../experiment-tracking/components/modals/GenericInputModal';
import { mountWithIntl } from '../../common/utils/TestUtils';

describe('CreateModelPage', () => {
  let wrapper;
  let minimalProps;
  let minimalStore;
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  beforeEach(() => {
    minimalProps = {};
    minimalStore = mockStore({});
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <BrowserRouter>
          <CreateModelPage {...minimalProps} />
        </BrowserRouter>
      </Provider>,
    );
  });

  it('renders with minimal props and store without exploding', () => {
    expect(wrapper.find(CreateModelPage).length).toBe(1);
  });

  test('should show modal by default', () => {
    expect(wrapper.find(GenericInputModal).prop('isOpen')).toBe(true);
  });
});
