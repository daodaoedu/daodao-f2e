import { CircleX } from 'lucide-react';
import { Text } from '@/shared/ui/typography';

const ErrorMessage = ({ errText }) => (
  errText && (
  <div className="mt-2 flex items-center gap-2 rounded bg-[#FFEFF1] p-2 text-sm text-[#EF5364]">
    <CircleX size={20} className="flex-shrink-0" />
    <Text as="p">{errText}</Text>
  </div>
  )
);

export default ErrorMessage;
