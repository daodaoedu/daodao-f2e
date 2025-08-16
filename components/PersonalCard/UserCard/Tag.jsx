import { Badge } from '@/components/ui/badge';

const Tag = ({ label }) => (
  <Badge
    variant="secondary"
    className="m-1 whitespace-nowrap text-sm font-normal"
    style={{ backgroundColor: '#DEF5F5' }}
  >
    {label}
  </Badge>
);

export default Tag;
