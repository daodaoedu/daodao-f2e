import { extractApiErrorMessage } from "@daodao/api";
import { Alert } from "react-native";

export { extractApiErrorMessage };

/**
 * openapi-fetch 風格回應：有 error 就 throw（訊息已 unwrap）
 */
export function throwIfOpenApiError(
  response: { error?: unknown },
  fallbackMessage: string
): asserts response is { error?: undefined } {
  if (response.error) {
    throw new Error(extractApiErrorMessage(response.error, fallbackMessage));
  }
}

/**
 * 執行 async action；失敗時 Alert 並回傳 false
 */
export async function runWithErrorAlert(
  action: () => Promise<unknown>,
  options: { title: string; fallbackMessage: string }
): Promise<boolean> {
  try {
    await action();
    return true;
  } catch (error) {
    Alert.alert(options.title, extractApiErrorMessage(error, options.fallbackMessage));
    return false;
  }
}
