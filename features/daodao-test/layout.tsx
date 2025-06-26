import { DaodaoTestProvider } from "./contexts";

export const getDaodaoTestLayout = (page: React.ReactElement) => (
  <DaodaoTestProvider>
    <style>
      {`
        @font-face {
          font-family: "JejuHallasan";
          font-display: swap;
          src: url("https://db.onlinewebfonts.com/t/2da952d097bffd198ec0f0aa3fdd6804.woff2")format("woff2");
        }
      `}
    </style>
    {page}
    <div className="font-[JejuHallasan] invisible">預載字體</div>
  </DaodaoTestProvider>
);
