// 實踐相關的自定義 Hooks
import { useState, useEffect, useCallback } from 'react';
import { usePractice } from '../../contexts/PracticeContext';
import { Practice, CheckInRecord } from '../../services/practice/types';
import { calculateProgress, isCompleted } from '../../services/practice/utils';
import { ResourceType } from '../../services/practice/types';

// 單一實踐的詳細資訊 Hook
export const usePracticeDetails = (practiceId: string | null) => {
  const { getPractice, getCheckInHistory } = usePractice();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!practiceId) {
      setPractice(null);
      setCheckIns([]);
      return;
    }

    setLoading(true);
    
    const foundPractice = getPractice(practiceId);
    if (foundPractice) {
      setPractice(foundPractice);
      setCheckIns(getCheckInHistory(practiceId));
    }
    
    setLoading(false);
  }, [practiceId, getPractice, getCheckInHistory]);

  const stats = practice ? {
    completionRate: calculateProgress(practice.currentProgress, practice.totalAmount),
    isCompleted: isCompleted(practice.currentProgress, practice.totalAmount),
    totalCheckIns: checkIns.length,
    streakDays: practice.streak,
    completedGoals: practice.smallGoals.filter(g => g.isCompleted).length,
    totalGoals: practice.smallGoals.length
  } : null;

  return {
    practice,
    checkIns,
    stats,
    loading
  };
};

// 實踐列表管理 Hook
export const usePracticeList = () => {
  const { 
    practices, 
    filter, 
    stats, 
    loading, 
    error,
    setFilter, 
    resetFilter,
    deletePractice 
  } = usePractice();

  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);

  // 批量操作
  const selectAll = useCallback(() => {
    setSelectedPractices(practices.map(p => p.id));
  }, [practices]);

  const selectNone = useCallback(() => {
    setSelectedPractices([]);
  }, []);

  const toggleSelect = useCallback((practiceId: string) => {
    setSelectedPractices(prev => 
      prev.includes(practiceId)
        ? prev.filter(id => id !== practiceId)
        : [...prev, practiceId]
    );
  }, []);

  const batchDelete = useCallback(async () => {
    await Promise.all(selectedPractices.map(id => deletePractice(id)));
    setSelectedPractices([]);
  }, [selectedPractices, deletePractice]);

  return {
    practices,
    filter,
    stats,
    loading,
    error,
    selectedPractices,
    setFilter,
    resetFilter,
    selectAll,
    selectNone,
    toggleSelect,
    batchDelete
  };
};

// 簽到功能 Hook
export const useCheckIn = (practiceId: string | null) => {
  const { checkIn, getPractice } = usePractice();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCheckIn = useCallback(async (
    progress: number,
    note?: string,
    mood?: string
  ) => {
    if (!practiceId) return;

    const practice = getPractice(practiceId);
    if (!practice) return;

    setSubmitting(true);
    setError(null);

    try {
      await checkIn({
        practiceId,
        progress: progress - practice.currentProgress,
        note,
        mood: mood as any
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '簽到失敗');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [practiceId, checkIn, getPractice]);

  return {
    submitCheckIn,
    submitting,
    error
  };
};

// 小目標管理 Hook
export const useSmallGoals = (practiceId: string | null) => {
  const { getPractice, updatePractice } = usePractice();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const practice = practiceId ? getPractice(practiceId) : null;
  const goals = practice?.smallGoals || [];

  const addGoal = useCallback(async (content: string) => {
    if (!practiceId) return;
    setLoading(true);
    setError(null);
    try {
      const newGoal = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        isCompleted: false,
        order: goals.length
      };
      await updatePractice(practiceId, { smallGoals: [...goals, newGoal] });
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增小目標失敗');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [practiceId, updatePractice, goals]);

  const toggleGoal = useCallback(async (goalId: string, isCompleted: boolean) => {
    if (!practiceId) return;
    setLoading(true);
    setError(null);
    try {
      const updatedGoals = goals.map(goal =>
        goal.id === goalId ? { ...goal, isCompleted, completedAt: isCompleted ? new Date().toISOString() : undefined } : goal
      );
      await updatePractice(practiceId, { smallGoals: updatedGoals });
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新小目標失敗');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [practiceId, updatePractice, goals]);

  const removeGoal = useCallback(async (goalId: string) => {
    if (!practiceId) return;
    setLoading(true);
    setError(null);
    try {
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      await updatePractice(practiceId, { smallGoals: updatedGoals });
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除小目標失敗');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [practiceId, updatePractice, goals]);

  return {
    goals,
    addGoal,
    toggleGoal,
    removeGoal,
    loading,
    error
  };
};

// 學習資源管理 Hook
export const useResources = (practiceId: string | null) => {
  const { getPractice, updatePractice } = usePractice();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const practice = practiceId ? getPractice(practiceId) : null;
  const resources = practice?.resources || [];

  const addNewResource = useCallback(async (
    name: string, 
    url?: string, 
    description?: string
  ) => {
    if (!practiceId) return;
    setLoading(true);
    setError(null);
    try {
      const newResource = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        url,
        description,
        type: ResourceType.WEBSITE,
        order: resources.length
      };
      await updatePractice(practiceId, { resources: [...resources, newResource] });
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增資源失敗');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [practiceId, updatePractice, resources]);

  const updateExistingResource = useCallback(async (
    resourceId: string,
    updates: { name?: string; url?: string; description?: string }
  ) => {
    if (!practiceId) return;
    setLoading(true);
    setError(null);
    try {
      const updatedResources = resources.map(resource =>
        resource.id === resourceId ? { ...resource, ...updates } : resource
      );
      await updatePractice(practiceId, { resources: updatedResources });
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新資源失敗');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [practiceId, updatePractice, resources]);

  const removeResource = useCallback(async (resourceId: string) => {
    if (!practiceId) return;
    setLoading(true);
    setError(null);
    try {
      const updatedResources = resources.filter(resource => resource.id !== resourceId);
      await updatePractice(practiceId, { resources: updatedResources });
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除資源失敗');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [practiceId, updatePractice, resources]);

  return {
    resources,
    addResource: addNewResource,
    updateResource: updateExistingResource,
    removeResource,
    loading,
    error
  };
};

// 統計資訊 Hook
export const usePracticeStats = () => {
  const { practices, stats } = usePractice();
  
  const detailedStats = {
    ...stats,
    byStatus: {
      draft: practices.filter(p => p.status === 'draft').length,
      active: practices.filter(p => p.status === 'active').length,
      paused: practices.filter(p => p.status === 'paused').length,
      completed: practices.filter(p => p.status === 'completed').length,
      archived: practices.filter(p => p.status === 'archived').length
    },
    byContentType: practices.reduce((acc, practice) => {
      acc[practice.contentType] = (acc[practice.contentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    averageStreak: practices.length > 0 
      ? practices.reduce((sum, p) => sum + p.streak, 0) / practices.length 
      : 0,
    totalProgress: practices.reduce((sum, p) => sum + p.currentProgress, 0),
    totalTarget: practices.reduce((sum, p) => sum + p.totalAmount, 0)
  };

  return detailedStats;
};