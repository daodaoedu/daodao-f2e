// Practice Context - 更新版本，支援完整功能
import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { 
  Practice, 
  CheckInRecord, 
  SmallGoal, 
  Resource, 
  PracticeFilter, 
  PracticeStats,
  PracticeContextType,
  PracticeStatus,
  ContentType,
  CreatePracticeInput,
  UpdatePracticeInput,
  CheckInInput,
  ResourceType
} from '../services/practice/types';
import { PracticeStorage } from '../services/practice/storage';
import { CheckInService } from '../services/practice/checkIn';

// ==================== Context 建立 ====================

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

// ==================== Reducer 類型定義 ====================

type PracticeAction = 
  | { type: 'SET_PRACTICES'; payload: Practice[] }
  | { type: 'ADD_PRACTICE'; payload: Practice }
  | { type: 'UPDATE_PRACTICE'; payload: { id: string; updates: Partial<Practice> } }
  | { type: 'DELETE_PRACTICE'; payload: string }
  | { type: 'SET_CURRENT_PRACTICE'; payload: Practice | null }
  | { type: 'SET_FILTER'; payload: Partial<PracticeFilter> }
  | { type: 'RESET_FILTER' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_STATS'; payload: PracticeStats };

interface PracticeState {
  practices: Practice[];
  currentPractice: Practice | null;
  filter: PracticeFilter;
  stats: PracticeStats;
  loading: boolean;
  error: string | null;
}

// ==================== 初始狀態 ====================

const initialFilter: PracticeFilter = {
  searchTerm: '',
  status: undefined,
  contentType: undefined,
  motivationType: undefined,
  sortBy: 'updatedAt',
  sortOrder: 'desc'
};

const initialStats: PracticeStats = {
  total: 0,
  active: 0,
  completed: 0,
  paused: 0,
  archived: 0,
  totalCheckIns: 0,
  longestStreak: 0,
  averageProgress: 0
};

const initialState: PracticeState = {
  practices: [],
  currentPractice: null,
  filter: initialFilter,
  stats: initialStats,
  loading: false,
  error: null
};

// ==================== 工具函數 ====================

// 生成唯一ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 轉換 PathInfo 為 Practice
const pathInfoToPractice = (
  pathInfo: any, 
  smallGoals: any[], 
  resources: any[]
): CreatePracticeInput => {
  const contentTypeMap: Record<string, ContentType> = {
    'book': ContentType.BOOK,
    'video': ContentType.VIDEO,
    'articles': ContentType.ARTICLES,
    'podcast': ContentType.PODCAST,
    'course': ContentType.COURSE,
    'custom': ContentType.CUSTOM
  };

  return {
    title: pathInfo.title,
    description: pathInfo.notes || '',
    contentType: contentTypeMap[pathInfo.contentType] || ContentType.CUSTOM,
    totalAmount: parseInt(pathInfo.totalAmount, 10) || 1,
    targetDate: pathInfo.targetDate || undefined,
    motivationType: pathInfo.motivationType || undefined,
    customMotivation: pathInfo.customMotivation || undefined,
    reminderEnabled: pathInfo.reminderEnabled || false,
    reminderFrequency: pathInfo.reminderFrequency || 'daily',
    smallGoals: smallGoals.map((goal, index) => ({
      content: goal.content,
      isCompleted: false,
      order: index
    })),
    resources: resources.map((resource, index) => ({
      name: resource.name,
      url: resource.url,
      type: ResourceType.WEBSITE,
      order: index
    }))
  };
};

// 獲取內容類型對應的單位
const getUnitByContentType = (contentType: ContentType): string => {
  const unitMap: Record<ContentType, string> = {
    [ContentType.BOOK]: '頁',
    [ContentType.VIDEO]: '集',
    [ContentType.ARTICLES]: '篇',
    [ContentType.PODCAST]: '集',
    [ContentType.COURSE]: '堂',
    [ContentType.CUSTOM]: '項'
  };
  return unitMap[contentType] || '項';
};

// ==================== Reducer 函數 ====================

function practiceReducer(state: PracticeState, action: PracticeAction): PracticeState {
  switch (action.type) {
    case 'SET_PRACTICES':
      return {
        ...state,
        practices: action.payload,
        loading: false,
        error: null
      };

    case 'ADD_PRACTICE':
      return {
        ...state,
        practices: [action.payload, ...state.practices],
        currentPractice: action.payload
      };

    case 'UPDATE_PRACTICE':
      return {
        ...state,
        practices: state.practices.map(p => 
          p.id === action.payload.id 
            ? { ...p, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : p
        ),
        currentPractice: state.currentPractice?.id === action.payload.id
          ? { ...state.currentPractice, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : state.currentPractice
      };

    case 'DELETE_PRACTICE':
      return {
        ...state,
        practices: state.practices.filter(p => p.id !== action.payload),
        currentPractice: state.currentPractice?.id === action.payload ? null : state.currentPractice
      };

    case 'SET_CURRENT_PRACTICE':
      return {
        ...state,
        currentPractice: action.payload
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...action.payload }
      };

    case 'RESET_FILTER':
      return {
        ...state,
        filter: initialFilter
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        stats: action.payload
      };

    default:
      return state;
  }
}

// ==================== Provider 組件 ====================

interface PracticeProviderProps {
  children: ReactNode;
}

export const PracticeProvider: React.FC<PracticeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(practiceReducer, initialState);

  // ==================== 初始化載入 ====================

  useEffect(() => {
    loadData();
  }, []);

  // 自動更新統計
  useEffect(() => {
    updateStats();
  }, [state.practices]);

  // ==================== 資料載入 ====================

  const loadData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const practices = await PracticeStorage.load();
      dispatch({ type: 'SET_PRACTICES', payload: practices });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '載入資料失敗' });
      console.error('載入資料失敗:', error);
    }
  }, []);

  // ==================== 統計更新 ====================

  const updateStats = () => {
    const stats: PracticeStats = {
      total: state.practices.length,
      active: state.practices.filter(p => p.status === PracticeStatus.ACTIVE).length,
      completed: state.practices.filter(p => p.status === PracticeStatus.COMPLETED).length,
      paused: state.practices.filter(p => p.status === PracticeStatus.PAUSED).length,
      archived: state.practices.filter(p => p.status === PracticeStatus.ARCHIVED).length,
      totalCheckIns: state.practices.reduce((sum, p) => sum + (p.checkIns?.length || 0), 0),
      longestStreak: Math.max(0, ...state.practices.map(p => p.streak)),
      averageProgress: state.practices.length > 0 
        ? Math.round(state.practices.reduce((sum, p) => sum + ((p.currentProgress / p.totalAmount) * 100), 0) / state.practices.length)
        : 0
    };
    
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  };

  // ==================== 實踐管理方法 ====================

  const createPractice = useCallback(async (input: CreatePracticeInput): Promise<Practice> => {
    try {
      const now = new Date().toISOString();
      const newPractice: Practice = {
        id: generateId(),
        title: input.title,
        description: input.description,
        contentType: input.contentType,
        totalAmount: input.totalAmount,
        currentProgress: 0,
        unit: getUnitByContentType(input.contentType),
        startDate: now.split('T')[0],
        targetDate: input.targetDate,
        status: PracticeStatus.ACTIVE,
        motivationType: input.motivationType,
        customMotivation: input.customMotivation,
        isPublic: true,
        reminderEnabled: input.reminderEnabled,
        reminderFrequency: input.reminderFrequency,
        streak: 0,
        lastCheckinDate: undefined,
        smallGoals: input.smallGoals?.map((goal, index) => ({
          id: generateId(),
          content: goal.content,
          isCompleted: goal.isCompleted,
          order: goal.order || index
        })) || [],
        resources: input.resources?.map((resource, index) => ({
          id: generateId(),
          name: resource.name,
          url: resource.url,
          type: resource.type,
          description: resource.description,
          order: resource.order || index
        })) || [],
        checkIns: [],
        createdAt: now,
        updatedAt: now
      };

      await PracticeStorage.save([...state.practices, newPractice]);
      dispatch({ type: 'ADD_PRACTICE', payload: newPractice });
      
      return newPractice;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '建立實踐失敗' });
      throw error;
    }
  }, [state.practices]);

  const createPracticeFromPathInfo = useCallback(async (pathInfo: any, smallGoals: any[], resources: any[]): Promise<string> => {
    const input = pathInfoToPractice(pathInfo, smallGoals, resources);
    const practice = await createPractice(input);
    return practice.id;
  }, [createPractice]);

  const updatePractice = useCallback(async (id: string, input: UpdatePracticeInput): Promise<Practice> => {
    try {
      const practice = state.practices.find(p => p.id === id);
      if (!practice) {
        throw new Error('找不到指定的實踐');
      }

      const updates: Partial<Practice> = {
        ...input,
        updatedAt: new Date().toISOString()
      };

      const updatedPractices = state.practices.map(p => 
        p.id === id ? { ...p, ...updates } : p
      );

      await PracticeStorage.save(updatedPractices);
      dispatch({ type: 'UPDATE_PRACTICE', payload: { id, updates } });
      
      const updatedPractice = updatedPractices.find(p => p.id === id)!;
      return updatedPractice;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '更新實踐失敗' });
      throw error;
    }
  }, [state.practices]);

  const deletePractice = useCallback(async (id: string): Promise<void> => {
    try {
      const updatedPractices = state.practices.filter(p => p.id !== id);
      await PracticeStorage.save(updatedPractices);
      dispatch({ type: 'DELETE_PRACTICE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '刪除實踐失敗' });
      throw error;
    }
  }, [state.practices]);

  // ==================== 簽到管理方法 ====================

  const checkIn = useCallback(async (input: CheckInInput): Promise<CheckInRecord> => {
    try {
      const practice = state.practices.find(p => p.id === input.practiceId);
      if (!practice) {
        throw new Error('找不到指定的實踐');
      }

      // 驗證簽到輸入
      const validation = CheckInService.validateCheckInInput(practice, input);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // 建立簽到記錄
      const checkInRecord = CheckInService.createCheckIn(practice, input);

      // 計算新的連續天數
      const oldStreak = practice.streak;
      const updatedCheckIns = [...practice.checkIns, checkInRecord];
      const newStreak = CheckInService.calculateStreak({ ...practice, checkIns: updatedCheckIns });

      // 檢查里程碑
      const milestones = CheckInService.checkMilestones(newStreak, oldStreak);

      // 更新實踐
      const newProgress = practice.currentProgress + input.progress;
      const newStatus = newProgress >= practice.totalAmount ? PracticeStatus.COMPLETED : practice.status;

      const updatedPractice: Practice = {
        ...practice,
        currentProgress: newProgress,
        streak: newStreak,
        lastCheckinDate: checkInRecord.date,
        status: newStatus,
        checkIns: updatedCheckIns,
        updatedAt: new Date().toISOString()
      };

      const updatedPractices = state.practices.map(p => 
        p.id === input.practiceId ? updatedPractice : p
      );

      await PracticeStorage.save(updatedPractices);
      dispatch({ type: 'UPDATE_PRACTICE', payload: { 
        id: input.practiceId, 
        updates: {
          currentProgress: newProgress,
          streak: newStreak,
          lastCheckinDate: checkInRecord.date,
          status: newStatus,
          checkIns: updatedCheckIns
        }
      }});

      // 如果有里程碑，可以在這裡觸發慶祝動畫
      if (milestones.length > 0) {
        console.log('達成里程碑:', milestones);
      }

      return checkInRecord;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '簽到失敗' });
      throw error;
    }
  }, [state.practices]);

  const getCheckInHistory = useCallback((practiceId: string): CheckInRecord[] => {
    const practice = state.practices.find(p => p.id === practiceId);
    return practice?.checkIns || [];
  }, [state.practices]);

  // ==================== 篩選和搜尋方法 ====================

  const setFilter = useCallback((filter: Partial<PracticeFilter>) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const resetFilter = useCallback(() => {
    dispatch({ type: 'RESET_FILTER' });
  }, []);

  // ==================== 工具方法 ====================

  const getPractice = useCallback((id: string): Practice | undefined => {
    return state.practices.find(p => p.id === id);
  }, [state.practices]);

  const calculateStreak = useCallback((practiceId: string): number => {
    const practice = state.practices.find(p => p.id === practiceId);
    return practice ? CheckInService.calculateStreak(practice) : 0;
  }, [state.practices]);

  const getProgress = useCallback((practiceId: string): number => {
    const practice = state.practices.find(p => p.id === practiceId);
    return practice ? (practice.currentProgress / practice.totalAmount) * 100 : 0;
  }, [state.practices]);

  const canCheckInToday = useCallback((practiceId: string): boolean => {
    const practice = state.practices.find(p => p.id === practiceId);
    return practice ? !CheckInService.hasCheckedInToday(practice) : false;
  }, [state.practices]);

  const exportData = useCallback((): string => {
    return PracticeStorage.exportData(state.practices);
  }, [state.practices]);

  const importData = useCallback(async (data: string): Promise<void> => {
    try {
      const practices = await PracticeStorage.importData(data);
      await PracticeStorage.save(practices);
      dispatch({ type: 'SET_PRACTICES', payload: practices });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '匯入資料失敗' });
      throw error;
    }
  }, []);

  // ==================== Context 值 ====================

  const contextValue: PracticeContextType = {
    // 狀態
    practices: state.practices,
    currentPractice: state.currentPractice,
    filter: state.filter,
    stats: state.stats,
    loading: state.loading,
    error: state.error ?? undefined,

    // 操作方法
    createPractice,
    updatePractice,
    deletePractice,
    checkIn,
    
    // 查詢方法
    getPractice,
    getCheckInHistory,
    
    // 篩選和搜尋
    setFilter,
    resetFilter,
    
    // 資料管理
    exportData,
    importData,
    
    // 工具方法
    calculateStreak,
    getProgress,
    canCheckInToday,

    // 便利方法（向後相容）
    createPracticeFromPathInfo
  };

  return (
    <PracticeContext.Provider value={contextValue}>
      {children}
    </PracticeContext.Provider>
  );
};

// ==================== Custom Hook ====================

export const usePractice = (): PracticeContextType => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within PracticeProvider');
  }
  return context;
};

// ==================== 專用 Hooks ====================

// 獲取篩選後的實踐列表
export const useFilteredPractices = (): Practice[] => {
  const { practices, filter } = usePractice();
  
  return React.useMemo(() => {
    let filtered = [...practices];

    // 搜尋過濾
    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(practice => 
        practice.title.toLowerCase().includes(searchTerm) ||
        practice.description?.toLowerCase().includes(searchTerm) ||
        practice.smallGoals.some(goal => goal.content.toLowerCase().includes(searchTerm)) ||
        practice.resources.some(resource => resource.name.toLowerCase().includes(searchTerm))
      );
    }

    // 狀態過濾
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(practice => filter.status!.includes(practice.status));
    }

    // 內容類型過濾
    if (filter.contentType && filter.contentType.length > 0) {
      filtered = filtered.filter(practice => filter.contentType!.includes(practice.contentType));
    }

    // 動機類型過濾
    if (filter.motivationType && filter.motivationType.length > 0) {
      filtered = filtered.filter(practice => 
        practice.motivationType && filter.motivationType!.includes(practice.motivationType)
      );
    }

    // 排序
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filter.sortBy) {
          case 'createdAt':
          case 'updatedAt':
            aValue = new Date(a[filter.sortBy]).getTime();
            bValue = new Date(b[filter.sortBy]).getTime();
            break;
          case 'progress':
            aValue = (a.currentProgress / a.totalAmount) * 100;
            bValue = (b.currentProgress / b.totalAmount) * 100;
            break;
          case 'streak':
            aValue = a.streak;
            bValue = b.streak;
            break;
          default:
            return 0;
        }

        if (filter.sortOrder === 'desc') {
          return bValue - aValue;
        } else {
          return aValue - bValue;
        }
      });
    }

    return filtered;
  }, [practices, filter]);
};

// 獲取特定實踐的統計
export const usePracticeStats = (practiceId?: string) => {
  const { practices, getCheckInHistory } = usePractice();
  
  return React.useMemo(() => {
    if (!practiceId) return null;
    
    const practice = practices.find(p => p.id === practiceId);
    if (!practice) return null;
    
    const checkIns = getCheckInHistory(practiceId);
    
    return {
      practice,
      checkIns,
      totalCheckIns: checkIns.length,
      completionRate: (practice.currentProgress / practice.totalAmount) * 100,
      streak: practice.streak,
      isCompleted: practice.currentProgress >= practice.totalAmount,
      canCheckInToday: !CheckInService.hasCheckedInToday(practice)
    };
  }, [practiceId, practices, getCheckInHistory]);
};

// 獲取當前進行中的實踐
export const useActivePractices = (): Practice[] => {
  const { practices } = usePractice();
  
  return React.useMemo(() => {
    return practices.filter(p => p.status === PracticeStatus.ACTIVE);
  }, [practices]);
};

export default PracticeContext;