import {
  _client,
  MLFLOW_IPC_RESPONSE_ID_FIELD,
  MLFLOW_IPC_REQUEST_ID_FIELD,
} from './UniverseFrontendApis';

describe('UniverseFrontendApis', () => {
  const origin = 'https://databricks.com';
  let windowSpy;
  let postMessageMock;
  const addEventListenerMock = jest.fn();

  beforeEach(() => {
    postMessageMock = jest.fn();
    windowSpy = jest.spyOn(global, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      addEventListener: addEventListenerMock,
      location: { origin },
      parent: {
        location: { origin },
        postMessage: postMessageMock,
      },
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  test('Messages are sent with expected format', () => {
    const promise = _client.request({ api: 'api', args: 'args' }, 0);
    expect(postMessageMock.mock.calls.length).toBe(1);
    expect(postMessageMock.mock.calls[0][0]).toEqual({
      api: 'api',
      args: 'args',
      [MLFLOW_IPC_REQUEST_ID_FIELD]: promise._message_id,
    });
    expect(postMessageMock.mock.calls[0][1]).toBe('https://databricks.com');
  });

  test('Successfull messages are resolved', (done) => {
    const promise = _client.request({ type: 'type', payload: 'payload' }, 0);
    // send response to complete the promise ^
    _client._receive({
      origin,
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: promise._message_id, payload: 'valid response' },
    });
    // check the return value
    promise.then((result) => {
      try {
        expect(result).toBe('valid response');
        expect(addEventListenerMock.mock.calls.length).toBe(1);
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  test('Failed messages are rejected', (done) => {
    const promise = _client.request({ type: 'type', payload: 'payload' }, 0);
    // send response to complete the promise ^
    _client._receive({
      origin,
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: promise._message_id, error: 'Error!' },
    });
    // check the return value
    promise
      .then((result) => {
        done(new Error('The promise should have thrown!'));
      })
      .catch((err) => {
        expect(err).toEqual(new Error('Error!'));
        expect(addEventListenerMock.mock.calls.length).toBe(1);
        done();
      });
  });

  test('Messages time out', (done) => {
    const promise = _client.request({ type: 'type', payload: 'payload' }, 5);
    // check the return value
    promise
      .then((result) => {
        done(new Error('The promise should have thrown!'));
      })
      .catch((err) => {
        expect(err).toEqual(new Error('Request timed out after 0.005 seconds.'));
        expect(addEventListenerMock.mock.calls.length).toBe(1);
        done();
      });
  });

  test('Messages that are answered in time do not time out', (done) => {
    const promise = _client.request({ type: 'type', payload: 'payload' }, 100);
    // send response to complete the promise ^
    _client._receive({
      origin,
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: promise._message_id, payload: 'valid response' },
    });
    setTimeout(() => {
      // check the return value
      promise.then((result) => {
        expect(result).toBe('valid response');
        done();
      });
    }, 100);
  });

  test('Messages with wrong origin are ignored', () => {
    const promise = _client.request({ type: 'type', payload: 'payload' }, 0);
    // send response to complete the promise ^
    _client._receive({
      origin: 'https:/some/place/else',
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: promise._message_id, payload: 'valid response 1' },
    });
    _client._receive({
      origin,
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: promise._message_id, payload: 'valid response 2' },
    });
    return promise.then((result) => {
      expect(result).toBe('valid response 2');
    });
  });

  test('Messages get correct responses', () => {
    const promise1 = _client.request({ type: 'type', payload: 'payload 1', id: 'id 1' }, 0);
    const promise2 = _client.request({ type: 'type', payload: 'payload 2', id: 'id 2' }, 0);
    const promise3 = _client.request({ type: 'type', payload: 'payload 3', id: 'id 3' }, 0);
    // This message should be ignored.
    _client._receive({
      origin,
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: 'id 4', payload: 'valid response 4' },
    });
    _client._receive({
      origin,
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: promise3._message_id, payload: 'valid response 3' },
    });
    _client._receive({
      origin,
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: promise1._message_id, payload: 'valid response 1' },
    });
    _client._receive({
      origin,
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: promise2._message_id, payload: 'valid response 2' },
    });
    // check the return value
    return promise1.then((result1) => {
      expect(result1).toBe('valid response 1');
      promise2.then((result2) => {
        expect(result2).toBe('valid response 2');
        promise3.then((result3) => {
          expect(result3).toBe('valid response 3');
        });
      });
    });
  });

  test('Messages can be _received only once', (done) => {
    const promise = _client.request({ type: 'type', payload: 'payload 1' }, 0);
    // send response to complete the promise ^
    _client._receive({
      origin,
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: promise._message_id, payload: 'valid response 2' },
    });
    _client._receive({
      origin,
      data: { [MLFLOW_IPC_RESPONSE_ID_FIELD]: promise._message_id, payload: 'valid response 1' },
    });
    promise.then((result) => {
      expect(result).toBe('valid response 2');
      done();
    });
  });
});
