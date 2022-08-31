import React from 'react';
import { Skeleton } from '@databricks/design-system';
import { SectionErrorBoundary } from '../../common/components/error-boundaries/SectionErrorBoundary';

const Plot = React.lazy(() => import('react-plotly.js'));
// BEGIN-EDGE
const PlotlyStylesProvider = React.lazy(() =>
  import('../../common/components/PlotlyStylesProvider'),
);
// END-EDGE

export const LazyPlot = (props) => (
  <SectionErrorBoundary>
    <React.Suspense fallback={<Skeleton active />}>
      <Plot {...props} />
      {/* BEGIN-EDGE */}
      <PlotlyStylesProvider />
      {/* END-EDGE */}
    </React.Suspense>
  </SectionErrorBoundary>
);
