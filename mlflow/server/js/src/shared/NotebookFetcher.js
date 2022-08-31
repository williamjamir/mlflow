/**
 * Class to fetch notebooks by ID from the webapp treestore through backbone.
 *
 * This is copied over from universe/webapp/web/js/mlflow/dashboard/recent/NotebookFetcher.ts
 */
export class NotebookFetcher {
  constructor(windowConnection, treeCollection) {
    this.windowConnection = windowConnection;
    this.treeCollection = treeCollection;
  }

  async prefetchTreeStoreNodes(ids) {
    if (ids.length === 0) {
      return Promise.resolve();
    }
    // Prefetch the ids that are not currently available in the treeCollection
    const missingIds = ids.filter((id) => this.treeCollection.get(id) === undefined);
    return new Promise((resolve, reject) =>
      this.windowConnection.prefetchNodes(missingIds, resolve),
    );
  }

  /**
   * Returns notebook data when they exist and are not deleted in the tree store, skips
   * invalid or deleted or inaccessible notebooks.
   * @param notebookIds notebooks to fetch by id
   * @returns promise of list of notebooks retrieved
   */
  async getNotebooks(notebookIds) {
    const numericIds = [];
    for (const id of notebookIds) {
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId)) {
        numericIds.push(parsedId);
      }
    }
    await this.prefetchTreeStoreNodes(numericIds);

    const notebooks = [];
    for (const id of numericIds) {
      const treeModel = this.treeCollection.get(id);
      if (treeModel) {
        const treeNode = {
          id,
          name: treeModel.get('name'),
          full_path: treeModel.get('pathName'),
          is_deleted: treeModel.get('deleted'),
        };
        if (!treeNode.is_deleted) {
          notebooks.push(treeNode);
        }
      }
    }
    return notebooks;
  }
}
