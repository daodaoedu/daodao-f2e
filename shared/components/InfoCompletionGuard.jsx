import { useState, cloneElement } from 'react';
import { useAuth } from '@/contexts/Auth';
import CompleteInfoReminderDialog from './CompleteInfoReminderDialog';

export default function InfoCompletionGuard({ children }) {
  const { isComplete, isLoggedIn } = useAuth();
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
