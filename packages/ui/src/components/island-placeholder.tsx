import { Image } from './image';
import { Background, Container, Paper } from './wrapper';

interface IslandLoadingProps {
  title: string;
  children?: React.ReactNode;
}

const IslandPlaceholder = ({ title, children }: IslandLoadingProps) => (
  <Background className="min-h-screen">
    <Container className="pb-5">
      <Paper>
        <h2 className="text-center text-3xl font-bold tracking-[0.08em] text-basic-400">
          {title}
        </h2>
        <div className="flex items-center justify-center">
          <Image
            src="/assets/images/nobody-island.gif"
            alt="nobody-land"
            width={300}
            height={300}
          />
        </div>
        {children}
      </Paper>
    </Container>
  </Background>
);

export { IslandPlaceholder };
