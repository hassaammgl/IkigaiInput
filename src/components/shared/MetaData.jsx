import React from "react";

const MetaData = ({ title, author, tagsNames = [], content }) => {
  const keywords = tagsNames.join(", ");
  return (
    <>
      <head>
        <title>{title}</title>
        <meta name="author" content={author} />
        <meta name="keywords" content={keywords} />
        <meta name="description" content={content} />
      </head>
    </>
  );
};

export default MetaData;
