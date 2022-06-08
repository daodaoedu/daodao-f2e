import React, { useMemo, useRef } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
// import SEOConfig from "../../shared/components/SEO";
import Navigation from "../../shared/components/Navigation_v2";
import Footer from "../../shared/components/Footer_v2";
// import { JitsiMeeting } from "@jitsi/react-sdk";
import Script from "next/script";
import dynamic from "next/dynamic";

const JitsiMeeting = dynamic(
    () =>
        import("@jitsi/react-sdk").then(({ JitsiMeeting }) => JitsiMeeting),
    {
        ssr: false,
    }
);


const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const renderSpinner = () => (
  <div
    style={{
      fontFamily: "sans-serif",
      textAlign: "center",
    }}
  >
    Loading..
  </div>
);

const handleJitsiIFrameRef1 = (iframeRef) => {
    // iframeRef.style.border = "10px solid #3d3d3d";
    // iframeRef.style.background = "#3d3d3d";
    iframeRef.style.height = "100vh";
};

const MeetPage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: "多元學習資源平台｜島島阿學",
      description:
        "「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
      keywords: "島島阿學",
      author: "島島阿學",
      copyright: "島島阿學",
      imgLink: "https://www.daoedu.tw/preview.webp",
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          url: "https://www.daoedu.tw",
          potentialAction: {
            "@type": "SearchAction",
            "query-input": "required name=q",
            target: "https://www.daoedu.tw/search?q={q}",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          url: "https://www.daoedu.tw",
          logo: "https://www.daoedu.tw/favicon-112.png",
        },
      ],
    }),
    [router?.asPath]
  );
    const apiRef = useRef();
    const roomName = "DaoDaoEduuuu";
    const userFullName = "島民";

    // const handleApiReady = (apiObj) => {
    //   apiRef.current = apiObj;
    //   apiRef.current.on("knockingParticipant", handleKnockingParticipant);
    //   apiRef.current.on("audioMuteStatusChanged", (payload) =>
    //     handleAudioStatusChange(payload, "audio")
    //   );
    //   apiRef.current.on("videoMuteStatusChanged", (payload) =>
    //     handleAudioStatusChange(payload, "video")
    //   );
    //   apiRef.current.on("raiseHandUpdated", printEventOutput);
    //   apiRef.current.on("titleViewChanged", printEventOutput);
    //   apiRef.current.on("chatUpdated", handleChatUpdates);
    //   apiRef.current.on("knockingParticipant", handleKnockingParticipant);
    // };

  return (
    <HomePageWrapper>
      <Script src="https://meet.jit.si/external_api.js"></Script>
      {/* <SEOConfig data={SEOData} /> */}
      <Navigation />
      <JitsiMeeting
        // roomName={generateRoomName()}
        domain="meet.jit.si/DaoDaoEduuuu"
        roomName={roomName}
        spinner={renderSpinner}
        config={{
          subject: "xxx",
          hideConferenceSubject: false,
        }}
        // onApiReady={(externalApi) => handleApiReady(externalApi)}
        // onReadyToClose={handleReadyToClose}
        getIFrameRef={handleJitsiIFrameRef1}
        userInfo={{
          displayName: userFullName,
        }}
      />
      <Footer />
    </HomePageWrapper>
  );
};

// export const getServerSideProps = async () => {
//   // const { res, req, locale, defaultLocale } = ctx;
//   return {
//     props: {
//       isDev: process.env.NODE_ENV === "development",
//       fallback: {},
//     },
//   };
// };

export default MeetPage;
