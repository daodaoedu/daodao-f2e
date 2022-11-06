// Reference: https://blog.wick.technology/pwa-install-prompt/
import { useState, useEffect, useMemo } from 'react';

import window from 'global/window';

const isIOS = () => {
  if (window.navigator.standalone) {
    // User has already installed the app:
    return false;
  }
  const ua = window.navigator.userAgent;
  const isIPad = !!ua.match(/iPad/i);
  const isIPhone = !!ua.match(/iPhone/i);
  return isIPad || isIPhone;
};

const usePwaInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(undefined);

  useEffect(() => {
    const beforeInstallPromptHandler = (event) => {
      event.preventDefault();

      // Store the event for later use:
      setInstallPromptEvent(event);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    return () =>
      window.removeEventListener(
        'beforeinstallprompt',
        beforeInstallPromptHandler,
      );
  }, []);

  const type = useMemo(() => {
    if (installPromptEvent === null) return 'reset';
    if (installPromptEvent) return 'event';
    if (isIOS()) return 'iOS';
    return null;
  }, [installPromptEvent, window?.navigator]);

  const handleOpenPrompt = () => {
    if (installPromptEvent) {
      // Show native prompt:
      installPromptEvent.prompt();

      // Reset the event object:
      installPromptEvent.userChoice.then(() => setInstallPromptEvent(null));
    }
  };

  return [type, handleOpenPrompt];
};
export default usePwaInstallPrompt;
