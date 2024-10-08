import { getRedirectionStorage } from './storage';

export default function openLoginWindow(
  redirection = '',
  target = '/login/popup',
) {
  const width = 520;
  const height = 760;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  const features = `left=${left},top=${top},width=${width},height=${height}`;
  const loginWindow = window.open('', '_blank', features);
  if (redirection) getRedirectionStorage().set(redirection);
  if (loginWindow) loginWindow.location = target;

  return new Promise((resolve) => {
    const loop = setInterval(() => {
      if (loginWindow.closed) {
        clearInterval(loop);
        resolve();
      }
    }, 500);
  });
}
