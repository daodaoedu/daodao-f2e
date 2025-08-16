import { Paper } from '@/components/ui/paper';
import { cn } from '@/utils/cn';

export const TermsWrapper = ({ children, className, ...props }) => (
  <section
    className={cn(
      'pt-10 pb-10 relative flex flex-row items-start justify-center',
      className
    )}
    {...props}
  >
    {children}
  </section>
);

export const PaperWrapper = ({ children, className, ...props }) => (
  <Paper
    className={cn(
      'w-[min(90%,800px)] py-10 px-5 max-md:p-5',
      '[&>h2]:text-2xl [&>h2]:text-[min(max(24px,5vw),24px)] [&>h2]:text-wrap [&>h2]:mx-auto [&>h2]:mb-4 [&>h2]:text-[#293a3d] [&>h2]:text-center [&>h2]:font-medium',
      'max-md:[&>h2]:text-ellipsis max-md:[&>h2]:w-full',
      '[&>h3]:text-lg [&>h3]:font-medium [&>h3]:my-6 [&>h3]:text-[#293a3d]',
      '[&>p]:text-base [&>p]:mb-4 [&>p]:text-[#536166] [&>p]:leading-[150%]',
      '[&>a]:text-[#536166] [&>a]:text-[#16b9b3] hover:[&>a]:underline',
      '[&>ol]:counter-reset-[section] [&>ol>li]:counter-increment-[section] [&>ol>li]:mb-2',
      '[&>.sublist]:counter-reset-[item] [&>.sublist]:list-none [&>.sublist]:ml-5',
      '[&>.sublist>li]:counter-increment-[item] [&>.sublist>li]:list-none [&>.sublist>li]:flex [&>.sublist>li]:flex-row [&>.sublist>li]:items-start [&>.sublist>li]:justify-start [&>.sublist>li]:leading-[150%]',
      '[&>.sublist>li:before]:content-[counter(section)"."counter(item)"."] [&>.sublist>li:before]:font-normal [&>.sublist>li:before]:inline-block [&>.sublist>li:before]:w-8 [&>.sublist>li:before]:shrink-0',
      '[&>.sublist>li>p]:inline-block [&>.sublist>li>p]:pl-2 [&>.sublist>li>p]:mb-0',
      className
    )}
    {...props}
  >
    {children}
  </Paper>
);
