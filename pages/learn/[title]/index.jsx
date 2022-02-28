import { GetStaticProps } from "next";

export const getStaticProps = async (context) => {
  return {
    redirect: {
      destination: "/resource/:title",
      permanent: false,
    },
  };
};

const Learn = () => {
  return <div></div>;
};

export default Learn;
