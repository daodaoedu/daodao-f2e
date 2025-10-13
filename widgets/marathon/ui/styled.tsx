import { cn } from '@/shared/lib/cn';

interface SectionProps {
  title?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
  withContainer?: boolean;
}

export const Section = ({
  title,
  id,
  className,
  children,
  withContainer = true,
}: SectionProps) => (
  <section
    className={cn('body-md px-6 py-8 text-basic-400 md:py-[100px]', className)}
  >
    <div
      className={cn(
        withContainer && 'mx-auto max-w-[750px] lg:ml-56 lg:mr-12 xl:mx-auto'
      )}
    >
      {title && (
        <h2 className="heading-md text-basic-500" id={id}>
          {title}
        </h2>
      )}
      {children}
    </div>
  </section>
);

interface ListProps {
  className?: string;
  children: React.ReactNode;
}

export const List = ({ className, children }: ListProps) => (
  <ul className={cn('ml-6 list-disc', className)}>{children}</ul>
);
