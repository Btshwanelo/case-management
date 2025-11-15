import React, { useEffect, useState } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import Terms from '../../utils/termsAndConditions.md';
import ReactMarkdown from 'react-markdown';
// import ChakraUIRenderer from "chakra-ui-markdown-renderer";

const TermsAndConditionPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state for markdown content
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen m-6 ">
      <ReactMarkdown children={Terms} />
    </div>
  );
};

export default TermsAndConditionPage;
