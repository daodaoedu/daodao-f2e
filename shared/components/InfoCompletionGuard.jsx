import { useState, cloneElement } from 'react';
import { useSession } from '@/entities/session';
import CompleteInfoReminderDialog from './CompleteInfoReminderDialog';

export default function InfoCompletionGuard({ children }) {
  const { isComplete, isLoggedIn } = useSession();
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
        isLoggedIn && !isComplete ? { onClick: handleClickProxy } : {}
      )}
      <CompleteInfoReminderDialog isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
