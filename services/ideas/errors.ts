/**
 * Ideas 服務專用錯誤類型和處理機制
 */

// 基礎錯誤代碼枚舉
export enum IdeaErrorCode {
  // 網路相關錯誤
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  
  // 請求相關錯誤
  REQUEST_FAILED = 'REQUEST_FAILED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // 資源相關錯誤
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // 驗證錯誤
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
  FIELD_REQUIRED = 'FIELD_REQUIRED',
  FIELD_INVALID = 'FIELD_INVALID',
  
  // 業務邏輯錯誤
  CREATE_FAILED = 'CREATE_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  READ_FAILED = 'READ_FAILED',
  READ_LIST_FAILED = 'READ_LIST_FAILED',
  
  // 檔案相關錯誤
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_SUPPORTED = 'FILE_TYPE_NOT_SUPPORTED',
  
  // 權限相關錯誤
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  OWNERSHIP_REQUIRED = 'OWNERSHIP_REQUIRED',
  
  // 配額和限制錯誤
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // 系統錯誤
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  
  // 未知錯誤
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 基礎 Ideas 錯誤類別
export class IdeaError extends Error {
  public readonly code: IdeaErrorCode;
  public readonly statusCode?: number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(
    message: string,
    code: IdeaErrorCode = IdeaErrorCode.UNKNOWN_ERROR,
    statusCode?: number,
    details?: Record<string, any>,
    requestId?: string
  ) {
    super(message);
    this.name = 'IdeaError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    this.requestId = requestId;

    // 確保 stack trace 正確
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IdeaError);
    }
  }

  /**
   * 序列化錯誤為 JSON
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
    };
  }

  /**
   * 檢查是否為特定類型的錯誤
   */
  is(code: IdeaErrorCode): boolean {
    return this.code === code;
  }

  /**
   * 檢查是否為網路相關錯誤
   */
  isNetworkError(): boolean {
    return [
      IdeaErrorCode.NETWORK_ERROR,
      IdeaErrorCode.TIMEOUT,
      IdeaErrorCode.CONNECTION_FAILED,
    ].includes(this.code);
  }

  /**
   * 檢查是否為驗證錯誤
   */
  isValidationError(): boolean {
    return [
      IdeaErrorCode.VALIDATION_ERROR,
      IdeaErrorCode.SCHEMA_VALIDATION_FAILED,
      IdeaErrorCode.FIELD_REQUIRED,
      IdeaErrorCode.FIELD_INVALID,
    ].includes(this.code);
  }

  /**
   * 檢查是否為權限錯誤
   */
  isPermissionError(): boolean {
    return [
      IdeaErrorCode.UNAUTHORIZED,
      IdeaErrorCode.FORBIDDEN,
      IdeaErrorCode.PERMISSION_DENIED,
      IdeaErrorCode.OWNERSHIP_REQUIRED,
    ].includes(this.code);
  }

  /**
   * 檢查錯誤是否可重試
   */
  isRetryable(): boolean {
    return [
      IdeaErrorCode.NETWORK_ERROR,
      IdeaErrorCode.TIMEOUT,
      IdeaErrorCode.CONNECTION_FAILED,
      IdeaErrorCode.INTERNAL_SERVER_ERROR,
      IdeaErrorCode.SERVICE_UNAVAILABLE,
      IdeaErrorCode.TOO_MANY_REQUESTS,
    ].includes(this.code);
  }
}

// 驗證錯誤專用類別
export class IdeaValidationError extends IdeaError {
  public readonly field?: string;
  public readonly value?: any;
  public readonly constraint?: string;

  constructor(
    message: string,
    field?: string,
    value?: any,
    constraint?: string,
    details?: Record<string, any>
  ) {
    super(
      message,
      IdeaErrorCode.VALIDATION_ERROR,
      400,
      {
        field,
        value,
        constraint,
        ...details,
      }
    );
    this.name = 'IdeaValidationError';
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }
}

// 資源未找到錯誤專用類別
export class IdeaNotFoundError extends IdeaError {
  public readonly resourceId: string;
  public readonly resourceType: string;

  constructor(
    resourceId: string,
    resourceType: string = 'idea',
    message?: string
  ) {
    super(
      message || `${resourceType} with id ${resourceId} not found`,
      IdeaErrorCode.NOT_FOUND,
      404,
      { resourceId, resourceType }
    );
    this.name = 'IdeaNotFoundError';
    this.resourceId = resourceId;
    this.resourceType = resourceType;
  }
}

// 權限錯誤專用類別
export class IdeaPermissionError extends IdeaError {
  public readonly requiredPermission: string;
  public readonly action: string;

  constructor(
    action: string,
    requiredPermission: string,
    message?: string
  ) {
    super(
      message || `Permission denied: ${requiredPermission} required for ${action}`,
      IdeaErrorCode.PERMISSION_DENIED,
      403,
      { action, requiredPermission }
    );
    this.name = 'IdeaPermissionError';
    this.requiredPermission = requiredPermission;
    this.action = action;
  }
}

// 檔案處理錯誤專用類別
export class IdeaFileError extends IdeaError {
  public readonly fileName?: string;
  public readonly fileSize?: number;
  public readonly fileType?: string;

  constructor(
    message: string,
    code: IdeaErrorCode,
    fileName?: string,
    fileSize?: number,
    fileType?: string
  ) {
    super(message, code, 400, { fileName, fileSize, fileType });
    this.name = 'IdeaFileError';
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.fileType = fileType;
  }
}

// 配額錯誤專用類別
export class IdeaQuotaError extends IdeaError {
  public readonly quotaType: string;
  public readonly limit: number;
  public readonly current: number;

  constructor(
    quotaType: string,
    limit: number,
    current: number,
    message?: string
  ) {
    super(
      message || `${quotaType} quota exceeded: ${current}/${limit}`,
      IdeaErrorCode.QUOTA_EXCEEDED,
      429,
      { quotaType, limit, current }
    );
    this.name = 'IdeaQuotaError';
    this.quotaType = quotaType;
    this.limit = limit;
    this.current = current;
  }
}

// 錯誤工廠函數
export class IdeaErrorFactory {
  /**
   * 從 HTTP 狀態碼和回應創建錯誤
   */
  static fromHttpResponse(
    statusCode: number,
    responseData: any,
    requestId?: string
  ): IdeaError {
    const message = responseData?.message || responseData?.error || 'Request failed';
    const code = responseData?.code;
    const details = responseData?.details;

    switch (statusCode) {
      case 400:
        if (responseData?.field) {
          return new IdeaValidationError(
            message,
            responseData.field,
            responseData.value,
            responseData.constraint,
            details
          );
        }
        return new IdeaError(message, IdeaErrorCode.INVALID_REQUEST, statusCode, details, requestId);

      case 401:
        return new IdeaError(message, IdeaErrorCode.UNAUTHORIZED, statusCode, details, requestId);

      case 403:
        if (responseData?.action && responseData?.requiredPermission) {
          return new IdeaPermissionError(
            responseData.action,
            responseData.requiredPermission,
            message
          );
        }
        return new IdeaError(message, IdeaErrorCode.FORBIDDEN, statusCode, details, requestId);

      case 404:
        if (responseData?.resourceId) {
          return new IdeaNotFoundError(
            responseData.resourceId,
            responseData.resourceType,
            message
          );
        }
        return new IdeaError(message, IdeaErrorCode.NOT_FOUND, statusCode, details, requestId);

      case 409:
        return new IdeaError(message, IdeaErrorCode.RESOURCE_CONFLICT, statusCode, details, requestId);

      case 413:
        return new IdeaFileError(
          message,
          IdeaErrorCode.FILE_TOO_LARGE,
          responseData?.fileName,
          responseData?.fileSize,
          responseData?.fileType
        );

      case 429:
        if (responseData?.quotaType) {
          return new IdeaQuotaError(
            responseData.quotaType,
            responseData.limit,
            responseData.current,
            message
          );
        }
        return new IdeaError(message, IdeaErrorCode.RATE_LIMIT_EXCEEDED, statusCode, details, requestId);

      case 500:
        return new IdeaError(message, IdeaErrorCode.INTERNAL_SERVER_ERROR, statusCode, details, requestId);

      case 503:
        return new IdeaError(message, IdeaErrorCode.SERVICE_UNAVAILABLE, statusCode, details, requestId);

      default:
        const errorCode = code ? (code as IdeaErrorCode) : IdeaErrorCode.UNKNOWN_ERROR;
        return new IdeaError(message, errorCode, statusCode, details, requestId);
    }
  }

  /**
   * 從網路錯誤創建錯誤實例
   */
  static fromNetworkError(error: Error): IdeaError {
    if (error.name === 'AbortError') {
      return new IdeaError('Request timeout', IdeaErrorCode.TIMEOUT);
    }

    if (error.message.includes('Failed to fetch')) {
      return new IdeaError('Network connection failed', IdeaErrorCode.CONNECTION_FAILED);
    }

    return new IdeaError(error.message, IdeaErrorCode.NETWORK_ERROR);
  }

  /**
   * 從 Zod 驗證錯誤創建錯誤實例
   */
  static fromZodError(error: any): IdeaValidationError {
    const firstIssue = error.issues?.[0];
    if (firstIssue) {
      return new IdeaValidationError(
        firstIssue.message,
        firstIssue.path?.join('.'),
        firstIssue.received,
        firstIssue.code
      );
    }

    return new IdeaValidationError('Schema validation failed');
  }
}

// 錯誤處理工具函數
export class IdeaErrorHandler {
  /**
   * 取得用戶友好的錯誤訊息
   */
  static getUserFriendlyMessage(error: IdeaError): string {
    switch (error.code) {
      case IdeaErrorCode.NETWORK_ERROR:
      case IdeaErrorCode.CONNECTION_FAILED:
        return '網路連線異常，請檢查網路連線後重試';

      case IdeaErrorCode.TIMEOUT:
        return '請求逾時，請重試';

      case IdeaErrorCode.UNAUTHORIZED:
        return '請先登入後再試';

      case IdeaErrorCode.FORBIDDEN:
      case IdeaErrorCode.PERMISSION_DENIED:
        return '您沒有權限執行此操作';

      case IdeaErrorCode.NOT_FOUND:
        return '找不到指定的內容';

      case IdeaErrorCode.VALIDATION_ERROR:
        return error.message; // 驗證錯誤直接顯示具體訊息

      case IdeaErrorCode.FILE_TOO_LARGE:
        return '檔案太大，請選擇較小的檔案';

      case IdeaErrorCode.FILE_TYPE_NOT_SUPPORTED:
        return '不支援的檔案格式';

      case IdeaErrorCode.RATE_LIMIT_EXCEEDED:
      case IdeaErrorCode.TOO_MANY_REQUESTS:
        return '操作太頻繁，請稍後再試';

      case IdeaErrorCode.QUOTA_EXCEEDED:
        return '已達到使用限制';

      case IdeaErrorCode.INTERNAL_SERVER_ERROR:
        return '系統暫時異常，請稍後再試';

      case IdeaErrorCode.SERVICE_UNAVAILABLE:
      case IdeaErrorCode.MAINTENANCE_MODE:
        return '服務暫時不可用，請稍後再試';

      default:
        return '操作失敗，請重試';
    }
  }

  /**
   * 判斷錯誤是否應該顯示給用戶
   */
  static shouldShowToUser(error: IdeaError): boolean {
    // 系統內部錯誤不應該直接顯示給用戶
    return ![
      IdeaErrorCode.INTERNAL_SERVER_ERROR,
      IdeaErrorCode.UNKNOWN_ERROR,
    ].includes(error.code);
  }

  /**
   * 取得錯誤的重試延遲時間（毫秒）
   */
  static getRetryDelay(error: IdeaError, attempt: number): number {
    if (!error.isRetryable()) {
      return 0;
    }

    // 指數退避，最大 30 秒
    const baseDelay = 1000; // 1 秒
    const maxDelay = 30000; // 30 秒
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

    // 加入隨機抖動，避免雷擊效應
    const jitter = Math.random() * 0.3; // 30% 抖動
    return Math.floor(delay * (1 + jitter));
  }

  /**
   * 記錄錯誤（根據錯誤級別）
   */
  static logError(error: IdeaError, context?: Record<string, any>): void {
    const logData = {
      ...error.toJSON(),
      context,
    };

    if (error.statusCode && error.statusCode >= 500) {
      console.error('IdeaError [SEVERE]:', logData);
    } else if (error.statusCode && error.statusCode >= 400) {
      console.warn('IdeaError [WARNING]:', logData);
    } else {
      console.info('IdeaError [INFO]:', logData);
    }
  }
}