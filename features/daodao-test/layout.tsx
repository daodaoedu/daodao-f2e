import { DaodaoTestProvider } from "./contexts";

export const getDaodaoTestLayout = (page: React.ReactElement) => (
  <DaodaoTestProvider>
    <link
      href="https://db.onlinewebfonts.com/c/2da952d097bffd198ec0f0aa3fdd6804?family=JejuHallasan"
      rel="stylesheet"
    />
    {page}
  </DaodaoTestProvider>
);
