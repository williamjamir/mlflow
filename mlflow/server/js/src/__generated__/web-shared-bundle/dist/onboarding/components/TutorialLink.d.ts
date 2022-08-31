import React from 'react';
import type { RequireProperties } from '../../utils';
declare type TutorialLinkProps = RequireProperties<Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'role' | 'type'>, 'children'> & {
    eventName: string;
};
export default function TutorialLink({ eventName, onClick, ...props }: TutorialLinkProps): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TutorialLink.d.ts.map