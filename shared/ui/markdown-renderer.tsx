import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/shared/lib/cn';

interface MarkdownRendererProps {
  source?: string;
  className?: string;
}

const MarkdownRenderer = ({
  source = '',
  className,
}: MarkdownRendererProps) => {
  return (
    <div className={cn('markdown-renderer', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
