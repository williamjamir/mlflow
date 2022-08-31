import React from 'react';
declare type TutorialRouter = {
    pushPage: (page: React.ReactElement) => void;
    popPage: () => void;
    goHome: () => void;
};
export declare const TutorialRouterContext: React.Context<TutorialRouter>;
export declare function TutorialRoutes({ initialRoute }: {
    initialRoute: React.ReactElement;
}): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function useTutorialRoute(): TutorialRouter;
/**
 * @deprecated
 */
export declare function useTutorialRouter(initialRoute: React.ReactElement): TutorialRouter & {
    currentRoute: React.ReactElement;
};
export {};
//# sourceMappingURL=useTutorialRouter.d.ts.map