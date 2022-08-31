import _ from 'lodash';

import { NotebookFetcher } from './NotebookFetcher';

describe('NotebookFetcher', () => {
  let windowConnection;
  let treeNodeCollection;
  let treeNodes;

  const getTreeNode = (numNotebooks, deleted) => {
    return _.range(numNotebooks).reduce((acc, i) => {
      return {
        ...acc,
        [i]: {
          id: i,
          name: `my notebook ${i}`,
          deleted: deleted.includes(i),
          pathName: `path/to/my notebook ${i}`,
          get(prop) {
            return this[prop];
          },
        },
      };
    }, {});
  };

  beforeEach(() => {
    treeNodes = getTreeNode(10, [5]);
    windowConnection = {
      prefetchNodes: jest.fn((ids, resolve) => resolve && resolve()),
    };
    treeNodeCollection = {
      get: jest.fn((id) => treeNodes[id]),
    };
  });

  describe('Fetching', () => {
    it('can fetch an empty list', async () => {
      const fetcher = new NotebookFetcher(windowConnection, treeNodeCollection);
      const results = await fetcher.getNotebooks([]);
      expect(results).toEqual([]);
    });

    it('should should fetch all valid notebooks', async () => {
      const fetcher = new NotebookFetcher(windowConnection, treeNodeCollection);
      // 5 is deleted
      // 101 and 102 need to be prefetched
      // "abc" is not a valid id
      const results = await fetcher.getNotebooks(['4', '5', '6', '100', '101', 'abc']);

      expect(windowConnection.prefetchNodes.mock.calls.length).toBe(1);
      expect(windowConnection.prefetchNodes.mock.calls[0][0]).toEqual([100, 101]);

      expect(results.length).toEqual(2);
      const expected = [
        {
          id: 4,
          name: 'my notebook 4',
          is_deleted: false,
          full_path: 'path/to/my notebook 4',
        },
        {
          id: 6,
          name: 'my notebook 6',
          is_deleted: false,
          full_path: 'path/to/my notebook 6',
        },
      ];
      expect(results).toEqual(expect.arrayContaining(expected));
    });
  });
});
