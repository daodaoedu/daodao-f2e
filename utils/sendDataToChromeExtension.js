/* eslint-disable no-undef */
const sendDataToChromeExtension = (
  extensionId = 'locidnghejlnnlnbglelhaflehebblei',
  data = {},
) => {
  // console.log('extensionId: ', extensionId);
  // console.log('ready to send data: ', data);
  // console.log('type: ', typeof chrome?.runtime?.sendMessage);
  if (typeof chrome?.runtime?.sendMessage === 'function') {
    chrome.runtime.sendMessage(extensionId, data, (response) => {
      if (!response.success) {
        console.log('error sending message ', response);
        return response;
      }
      console.log('success ', response.message);
      return response;
    });
  }
};

export default sendDataToChromeExtension;
