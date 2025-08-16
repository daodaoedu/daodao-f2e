import { Badge } from '@/components/ui/badge';

const Tag = ({ label }) => (
  <Badge
    variant="secondary"
    className="m-1 whitespace-nowrap font-normal text-sm"
    style={{ backgroundColor: '#DEF5F5' }}
  >
    {label}
  </Badge>
);

export default Tag;
