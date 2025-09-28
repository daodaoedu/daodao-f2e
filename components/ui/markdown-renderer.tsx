import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote-client/rsc';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/utils/cn';
import { useMemo } from 'react';

interface MarkdownRendererProps extends MDXRemoteProps {
  className?: string;
}

const MarkdownRenderer = ({
  className,
  options,
  ...props
}: MarkdownRendererProps) => {
  const mdxOptions = useMemo<MDXRemoteProps['options']>(
    () => ({
      ...options,
      mdxOptions: {
        ...options?.mdxOptions,
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeRaw, rehypeSanitize],
      },
    }),
    [options]
  );

  return (
    <div className={cn('markdown-renderer', className)}>
      <MDXRemote options={mdxOptions} {...props} />
    </div>
  );
};

export default MarkdownRenderer;
