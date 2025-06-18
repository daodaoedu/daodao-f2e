import ResponsiveModal, {
  ResponsiveModalSize,
} from "@/components/ui/responsive-modal";
import { ResourceSearchParamsSchema } from "@/services/resources/core/schema";
import ResourceSearchForm from "./ResourceSearchForm";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onFilter: (filters: ResourceSearchParamsSchema) => void;
  filters?: Partial<ResourceSearchParamsSchema>;
}

export default function ResourceSearchModal({
  open,
  onClose,
  onFilter,
  filters,
}: SearchModalProps) {
  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      size={ResponsiveModalSize.Large}
      hasCloseButton
      className="bg-primary-palest"
      title="篩選"
      titleClassName="font-bold text-left text-[1.75rem] text-basic-500"
    >
      <ResourceSearchForm
        onFilter={onFilter}
        onClose={onClose}
        filters={filters}
      />
    </ResponsiveModal>
  );
}
