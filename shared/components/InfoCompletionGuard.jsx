import { useState, cloneElement } from 'react';
import { useSelector } from 'react-redux';
import CompleteInfoReminderDialog from './CompleteInfoReminderDialog';

export default function InfoCompletionGuard({ children }) {
  const user = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClickProxy = (e) => {
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <>
      {cloneElement(
        children,
        user?._id && !user?.isComplete ? { onClick: handleClickProxy } : {},
      )}
      <CompleteInfoReminderDialog isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
