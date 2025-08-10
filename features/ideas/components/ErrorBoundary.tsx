import React, { Component, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

class IdeasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Ideas Error Boundary caught an error:', error, errorInfo);
    const { onError } = this.props;
    onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-basic-200 bg-white p-8 text-center">
          <AlertTriangle className="mb-4 size-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-basic-500">出現問題了</h3>
          <p className="mb-4 text-sm text-basic-400">
            想法功能暫時無法使用，請稍後再試
          </p>
          <Button
            onClick={this.handleRetry}
            variant="outline"
            className="border-basic-200 text-basic-500 hover:bg-basic-100"
          >
            <RefreshCw className="mr-2 size-4" />
            重新載入
          </Button>
        </div>
      );
    }

    return children;
  }
}

// Network Error Component
interface NetworkErrorProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  message?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  isRetrying = false,
  message = '網路連線出現問題',
}) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-basic-200 bg-white p-8 text-center">
    <AlertTriangle className="mb-4 size-12 text-orange-500" />
    <h3 className="mb-2 text-lg font-semibold text-basic-500">連線問題</h3>
    <p className="mb-4 text-sm text-basic-400">{message}</p>
    {onRetry && (
    <Button
      onClick={onRetry}
      disabled={isRetrying}
      variant="outline"
      className="border-basic-200 text-basic-500 hover:bg-basic-100"
    >
      <RefreshCw className={`mr-2 size-4 ${isRetrying ? 'animate-spin' : ''}`} />
      {isRetrying ? '重試中...' : '重新連線'}
    </Button>
    )}
  </div>
);

// Hook for network retry logic
export const useNetworkRetry = (retryFn: () => Promise<void>) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const retry = React.useCallback(async () => {
    setIsRetrying(true);
    try {
      await retryFn();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  }, [retryFn]);

  return { retry, isRetrying };
};

export default IdeasErrorBoundary;
