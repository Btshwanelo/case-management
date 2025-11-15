import React from 'react';

const XiqIcon = ({ iconHtml }) => {
  return <div dangerouslySetInnerHTML={{ __html: iconHtml }} />;
};

export default XiqIcon;
