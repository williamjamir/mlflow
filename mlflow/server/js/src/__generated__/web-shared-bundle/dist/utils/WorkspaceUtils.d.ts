export interface WorkspaceDescriptor {
    azureLocation: string;
    deploymentName: string;
    name: string;
    needsConfirmation: boolean;
    orgId: number;
    owner?: string;
    useRegionalUrl: boolean;
    isComplianceMode?: boolean;
}
export declare class WorkspaceUtils {
    static getHostname(): string;
    /**
     * Returns the URL used to select a workspace to switch to
     * If useAbsoluteUrlForWorkspaceSelection is true, returns absolute URL. If returned URL has
     * different hostname than current hostname, path is /aad/auth to avoid user having to click login
     * on per-workspace URL.
     *
     * @param workspace {object} that contains {deploymentName: string, orgId: int,
     *                   azureLocation: string, useRegionalUrl: boolean}
     * @param useAbsoluteUrlForWorkspaceSelection {boolean} whether to return absolute URL or relative
     *        URL
     * @param domainSuffix {string} suffix to be used if constructing absolute URL
     * @param basePath {string} base path to be included in the workspace URL
     *
     * @returns URL to be used in link to workspace
     */
    static getSwitchWorkspaceUrl(workspace: WorkspaceDescriptor, useAbsoluteUrlForWorkspaceSelection: boolean, domainSuffix: string, basePath?: string): string;
}
//# sourceMappingURL=WorkspaceUtils.d.ts.map