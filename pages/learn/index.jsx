import { GetStaticProps } from "next";

export const getStaticProps = async (context) => {
  return {
    redirect: {
      destination: "/resource",
      permanent: false,
    },
  };
};

const Learn = () => {
  return <div></div>;
};

export default Learn;
