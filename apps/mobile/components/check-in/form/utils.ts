import * as FileSystem from "expo-file-system";

/**
 * 將本地 URI 轉換為 base64 字串
 */
export const uriToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error converting URI to base64:", error);
    throw error;
  }
};

/**
 * 將多個本地 URI 轉換為 base64 陣列
 */
export const convertMediaUrisToBase64 = async (uris: string[]): Promise<string[]> => {
  const base64Strings: string[] = [];

  for (const uri of uris) {
    try {
      const base64 = await uriToBase64(uri);
      base64Strings.push(base64);
    } catch (error) {
      console.error("Error converting URI:", uri, error);
    }
  }

  return base64Strings;
};
