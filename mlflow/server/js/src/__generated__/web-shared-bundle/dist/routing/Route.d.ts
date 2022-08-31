import type { lazyRoute } from './lazyRoute';
export interface RouteMetadata {
    /**
     * Unique identifier of the route, which will be used in all tracking (usage and performance).
     *
     * The format is a dot-separated hierarchical list of component names. E.g.:
     * - redash.queries.list
     * - redash.queries.editor
     * - webapp.clusters.list
     * - webapp.clusters.form
     *
     * Recommended format is:
     * <service-name>.<functionality>.<page-name>
     *
     * However, it is possible `<functionality>` to be further split in case the functionality
     * has multiple similar pages, e.g. `jaws.workflows.runs.list` and `jaws.workflows.jobs.list`.
     */
    pageId: string;
    /**
     * The URL path, which this route should be rendered for.
     *
     * The path supports standard path params (`/path/prefix/:id`) and wildcards (`/path/prefix/*`).
     */
    path: string;
    /**
     * The route element, which should be rendered when the URL matches the expected path.
     */
    element: ReturnType<typeof lazyRoute>;
    /**
     * Nested routes, which are prefixed with the path of this route, e.g.:
     * ```ts
     * {
     *   pageId: '...',
     *   path: '/parent',
     *   children: [{
     *     pageId: '...',
     *     path: '/child/:id' // will match /parent/child/:id
     *   }]
     * }
     * ```
     *
     */
    children?: RouteMetadata[];
}
//# sourceMappingURL=Route.d.ts.map