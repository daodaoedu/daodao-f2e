import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/atoms/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: unknown) => void;
}

/**
 * Ideas 功能專用的錯誤邊界組件
 */
class IdeasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Ideas Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
    });

    const { onError } = this.props;
    onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  // eslint-disable-next-line class-methods-use-this
  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // 如果提供了自定義 fallback，使用它
      if (fallback) {
        return fallback;
      }

      // 默認錯誤 UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white rounded-lg border border-basic-200">
          <div className="w-16 h-16 mb-6 rounded-full bg-alert/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-alert" />
          </div>

          <h2 className="heading-md text-basic-black mb-2">
            哎呀！出了點問題
          </h2>

          <p className="body-sm text-basic-500 text-center mb-6 max-w-md">
            想法功能遇到了一些技術問題。請嘗試刷新頁面或稍後再試。
          </p>

          <div className="flex gap-3">
            <Button
              onClick={this.handleRetry}
              variant="outline"
              className="border-primary-base text-primary-base hover:bg-primary-base hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重試
            </Button>

            <Button
              onClick={this.handleReload}
              className="bg-primary-base hover:bg-primary-darker text-white"
            >
              重新載入頁面
            </Button>
          </div>

          {/* 開發環境顯示錯誤詳情 */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-8 w-full max-w-2xl">
              <summary className="cursor-pointer text-sm text-basic-400 hover:text-basic-600">
                錯誤詳情 (開發模式)
              </summary>
              <div className="mt-4 p-4 bg-basic-50 rounded-lg overflow-auto">
                <h3 className="font-medium text-sm text-basic-700 mb-2">錯誤訊息:</h3>
                <pre className="text-xs text-basic-600 mb-4 whitespace-pre-wrap">
                  {error.message}
                </pre>

                <h3 className="font-medium text-sm text-basic-700 mb-2">堆疊追蹤:</h3>
                <pre className="text-xs text-basic-600 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </div>
            </details>
          )}
        </div>
      );
    }

    return children;
  }
}

/**
 * 網路錯誤重試組件
 */
interface NetworkErrorProps {
  onRetry: () => void;
  isRetrying?: boolean;
  error?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  isRetrying = false,
  error = '網路連線出現問題'
}) => {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-alert/10 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-alert" />
      </div>

      <h3 className="heading-sm text-basic-500 mb-2">連線問題</h3>
      <p className="body-sm text-basic-400 mb-4">{error}</p>

      <Button
        onClick={onRetry}
        disabled={isRetrying}
        variant="outline"
        className="border-primary-base text-primary-base hover:bg-primary-base hover:text-white"
      >
        {isRetrying ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            重試中...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            重試
          </>
        )}
      </Button>
    </div>
  );
};

/**
 * Hook: 網路錯誤重試邏輯
 */
export const useNetworkRetry = (
  retryFn: () => void | Promise<void>,
  maxRetries: number = 3
) => {
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const retry = React.useCallback(async () => {
    if (retryCount >= maxRetries || isRetrying) return;

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      await retryFn();
      setRetryCount(0); // 重置計數器
    } catch (error) {
      console.error(`Retry ${retryCount + 1} failed:`, error);
    } finally {
      setIsRetrying(false);
    }
  }, [retryFn, retryCount, maxRetries, isRetrying]);

  const reset = React.useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    reset,
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries,
  };
};

export default IdeasErrorBoundary;
