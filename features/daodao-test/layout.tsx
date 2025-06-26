import { DaodaoTestProvider } from "./contexts";

export const getDaodaoTestLayout = (page: React.ReactElement) => (
  <DaodaoTestProvider>{page}</DaodaoTestProvider>
);
