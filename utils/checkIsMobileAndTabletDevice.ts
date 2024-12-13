export default function checkIsMobileAndTabletDevice() {
  const mobileDevice = [
    /Android/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /iPad/i,
    /iPhone/i,
    /iPod/i,
    /webOS/i,
  ];
  return mobileDevice.some((e) => navigator.userAgent.match(e));
}
