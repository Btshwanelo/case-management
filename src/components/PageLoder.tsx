import React from 'react';
import { Spinner } from './ui/spinner';

const PageLoder = () => {
  return (
    <div className="w-full min-h-[70vh] flex mt-6 justify-center items-center">
      <Spinner size="xl" />
    </div>
  );
};

export default PageLoder;
