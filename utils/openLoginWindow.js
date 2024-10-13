import { getRedirectionStorage } from './storage';

const INTERVAL = 500;
const TIMEOUT = 60 * 1000;

/**
 * 開啟登入視窗
 * @param {string} redirection 登入後重定向的地址
 * @param {string} target 目標地址，可以替換成 /?id=...&token=... 自動登入
 * @returns {Promise} 視窗關閉後 resolve
 */
export default function openLoginWindow(
  redirection = '',
  target = '/login/popup',
) {
  const width = 520;
  const height = 760;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  const features = `left=${left},top=${top},width=${width},height=${height}`;
  const loginWindow = window.open('', 'loginWindow', features);
  let times = 0;

  if (redirection) getRedirectionStorage().set(redirection);
  if (loginWindow) loginWindow.location = target;

  return new Promise((resolve, reject) => {
    const loop = setInterval(() => {
      if (times > TIMEOUT) {
        clearInterval(loop);
        // reject(new Error('登入視窗超時'));
        loginWindow?.close();
        return;
      }
      times += INTERVAL;
      if (loginWindow?.closed) {
        clearInterval(loop);
        resolve();
      }
    }, INTERVAL);
  });
}
