import {
  Dialog,
  DialogContent,
  DialogContentSize,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import ResourceSearchForm from "./ResourceSearchForm";

interface FilterState {
  resourceTypes: string[];
  feeTypes: string[];
  levelTypes: string[];
  durationTypes: string[];
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onFilter: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export default function ResourceSearchModal({
  open,
  onClose,
  onFilter,
  initialFilters,
}: SearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={(_open) => !_open && onClose()}>
      <DialogContent size={DialogContentSize.Medium} hasCloseButton>
        <DialogHeader>
          <DialogTitle className="text-left">篩選</DialogTitle>
        </DialogHeader>
        <ResourceSearchForm
          onFilter={onFilter}
          onClose={onClose}
          initialFilters={initialFilters}
        />
      </DialogContent>
    </Dialog>
  );
}
