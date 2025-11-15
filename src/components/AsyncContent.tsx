import React, { ReactNode } from 'react';
import PageLoder from './PageLoder';

const AsyncContent = ({ isLoading, children }: { isLoading?: boolean; children: ReactNode }) => {
  if (isLoading) {
    return <PageLoder />;
  }
  return <>{children}</>;
};

export default AsyncContent;
