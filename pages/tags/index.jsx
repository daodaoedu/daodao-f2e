import { GetStaticProps } from "next";

export const getStaticProps = async (context) => {
  return {
    redirect: {
      destination: "/search",
      permanent: false,
    },
  };
};

const Tags = () => {
  return <div></div>;
};

export default Tags;
