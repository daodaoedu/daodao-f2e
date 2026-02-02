import { cn } from "@/shared/lib/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoRows?: boolean;
  minRows?: number;
  maxRows?: number;
  value?: string;
}

function Textarea({
  rows,
  autoRows,
  minRows = 1,
  maxRows = Infinity,
  className,
  value,
  ...props
}: TextareaProps) {
  const newlineCount = value?.split("\n").length;
  const calcRows =
    typeof newlineCount === "number" && autoRows
      ? Math.max(minRows, Math.min(maxRows, newlineCount))
      : rows;

  return (
    <textarea className={cn("resize-none", className)} rows={calcRows} value={value} {...props} />
  );
}

export default Textarea;
