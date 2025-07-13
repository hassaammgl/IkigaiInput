import React from "react";

const MetaData = ({ title }) => {
  return (
    <>
      <head>
        <title>{title}</title>
        <meta name="author" content="John Smith" />
        <meta
          name="keywords"
          content="React, JavaScript, semantic markup, html"
        />
        <meta
          name="description"
          content="API reference for the <meta> component in React DOM"
        />
      </head>
    </>
  );
};

export default MetaData;
