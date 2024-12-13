export default function openWindowPopup({ url, title, width, height }) {
  // Fixes dual-screen position = Most browsers ?? Firefox
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;

  const systemZoom = window.outerWidth / window.screen.availWidth;
  const left = (window.outerWidth - width) / 2 / systemZoom + dualScreenLeft;
  const top = (window.outerHeight - height) / 2 / systemZoom + dualScreenTop;

  const features = `left=${left},top=${top},width=${width},height=${height}`;

  return window.open(url, title, features);
}
