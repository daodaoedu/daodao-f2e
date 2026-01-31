/**
 * 將 data URL 轉換為 File 物件
 */
export const dataURLtoFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0]?.match(/:(.*?);/);
  const mime = mimeMatch?.[1] || "image/jpeg";
  const base64Data = arr[1];
  if (!base64Data) {
    throw new Error("Invalid data URL");
  }
  const bstr = atob(base64Data);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

/**
 * 將 media File[] 轉換為 URL 陣列
 */
export const convertMediaToUrls = async (files: File[]): Promise<string[]> => {
  const urls: string[] = [];
  const loadPromises = files.map((file) => {
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          urls.push(e.target.result as string);
        }
        resolve();
      };
      reader.onerror = () => resolve();
      reader.readAsDataURL(file);
    });
  });

  await Promise.all(loadPromises);
  return urls;
};
