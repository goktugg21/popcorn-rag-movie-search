import React, { Suspense } from 'react';
import { withErrorBoundary } from './ErrorBoundary';

// HOC to wrap a component with both error boundary and suspense
export const withAsyncBoundary = (Component, LoadingSkeleton) => {
  // First wrap with error boundary
  const WithError = withErrorBoundary(Component);
  
  // Then return a component that includes suspense
  return (props) => (
    <Suspense fallback={LoadingSkeleton ? <LoadingSkeleton /> : <div>Loading...</div>}>
      <WithError {...props} />
    </Suspense>
  );
};

export default withAsyncBoundary;
