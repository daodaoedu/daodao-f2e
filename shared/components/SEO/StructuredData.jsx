import React from "react";
import Head from "next/head";

const StructuredData = ({ data }) => (
  <Head>
    <script
      key="ld+JSON"
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  </Head>
);

export default StructuredData;
