import React from 'react';
import termsAndCondition from '@/assets/file_terms.pdf';

const TermsAndConditionPage = () => {
  return (
    <div className="h-screen w-screen">
      <iframe src={termsAndCondition} className="w-full h-full" />
    </div>
  );
};

export default TermsAndConditionPage;
