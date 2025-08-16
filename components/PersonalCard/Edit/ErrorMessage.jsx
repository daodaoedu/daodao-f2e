import { CircleX } from 'lucide-react';
import { Text } from '@/components/ui/typography';

const ErrorMessage = ({ errText }) => (
  errText && (
  <div className="mt-2 flex items-center gap-2 text-[#EF5364] bg-[#FFEFF1] rounded p-2 text-sm">
    <CircleX size={20} className="flex-shrink-0" />
    <Text as="p">{errText}</Text>
  </div>
  )
);

export default ErrorMessage;
