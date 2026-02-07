import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  source?: string;
  className?: string;
}

const MarkdownRenderer = ({ source = "", className }: MarkdownRendererProps) => {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
        {source}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
