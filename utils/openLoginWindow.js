import { getRedirectionStorage } from "./storage";

const INTERVAL = 500;
const TIMEOUT = 60 * 1000;

export const startLoginListener = (callback) => {
  const receiveMessage = (e) => {
    if (e.origin !== window.location.origin) return;
    if (e.data.type === "login") {
      const { token, id } = e.data.payload;
      const redirectionStorage = getRedirectionStorage();
      const redirectUrl = redirectionStorage.get();
      if (typeof callback === "function") {
        callback(id, token);
      }
      if (redirectUrl) {
        redirectionStorage.remove();
        window.location.replace(redirectUrl);
      }
    }
  };
  window.addEventListener("message", receiveMessage, false);

  const stopLoginListener = () => {
    window.removeEventListener("message", receiveMessage, false);
  };

  return stopLoginListener;
};

export const sendLoginConfirmation = (id, token, redirectUrl) => {
  if (!id || !token) return;
  if (redirectUrl) getRedirectionStorage().set(redirectUrl);

  if (
    window.opener &&
    window.opener.location.origin === window.location.origin
  ) {
    window.opener.postMessage(
      { type: "login", payload: { id, token } },
      window.location.origin
    );
    window.close();
  } else {
    window.location.replace(redirectUrl);
  }
};

/**
 * 開啟登入視窗
 * @param {string} redirection 登入後重定向的地址
 * @param {string} target 目標地址，可以替換成 /?id=...&token=... 自動登入
 * @returns {Promise} 視窗關閉後 resolve
 */
export default function openLoginWindow(
  redirection = "",
  target = "/login/popup"
) {
  return new Promise((resolve, reject) => {
    const width = 520;
    const height = 760;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const features = `left=${left},top=${top},width=${width},height=${height}`;
    const loginWindow = window.open("", "loginWindow", features);
    let times = 0;

    if (redirection) getRedirectionStorage().set(redirection);
    if (!loginWindow) {
      window.location.replace("/login");
      resolve("彈窗被阻擋");
      return;
    }

    loginWindow.location = target;

    const loop = setInterval(() => {
      if (times > TIMEOUT) {
        clearInterval(loop);
        resolve("登入視窗超時");
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
