import { getRedirectionStorage } from './storage';

export default function openLoginWindow(
  redirection = '/',
  target = '/login/popup',
) {
  const width = 520;
  const height = 760;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  const features = `left=${left},top=${top},width=${width},height=${height}`;
  const loginWindow = window.open('', '_blank', features);
  getRedirectionStorage().set(redirection);
  if (loginWindow) loginWindow.location = target;
}
