/**
 * Check-in form utilities
 */

// expo-file-system types (for optional dependency)
interface IFileSystemModule {
  readAsStringAsync: (uri: string, options?: { encoding: string }) => Promise<string>;
  EncodingType: { Base64: string };
}

/**
 * 將本地 URI 轉換為 base64 字串
 * 需要 expo-file-system 套件
 */
export const uriToBase64 = async (uri: string): Promise<string> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const FileSystem = require("expo-file-system") as IFileSystemModule;
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
 * 將多個本地 URI 轉換為 base64 陣列（並行處理）
 */
export const convertMediaUrisToBase64 = async (uris: string[]): Promise<string[]> => {
  const results = await Promise.all(
    uris.map(async (uri) => {
      try {
        return await uriToBase64(uri);
      } catch (error) {
        console.error("Error converting URI:", uri, error);
        return null;
      }
    })
  );
  return results.filter((result): result is string => result !== null);
};
