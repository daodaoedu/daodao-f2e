import { MutationFetcher } from 'swr/mutation';
import {
  Practice,
  CheckInRecord,
  CreatePracticeInput,
  UpdatePracticeInput,
  CheckInInput,
  createPracticeSchema,
  updatePracticeSchema,
  checkInInputSchema
} from './schema';
import { getContentTypeUnit } from './utils';

export type PracticeSWRKey = string;

interface GetPracticePathnameProps {
  id?: string;
}

export const getPracticePathname = ({ id }: GetPracticePathnameProps = {}) =>
  id ? `/practice/${id}` : '/practice';

interface PracticeAPIType {
  create: MutationFetcher<Practice, PracticeSWRKey, CreatePracticeInput>;
  update: MutationFetcher<Practice, PracticeSWRKey, UpdatePracticeInput & { id: string }>;
  delete: MutationFetcher<void, PracticeSWRKey, Required<GetPracticePathnameProps>>;
  checkIn: MutationFetcher<CheckInRecord, PracticeSWRKey, CheckInInput>;
  exportData: MutationFetcher<string, PracticeSWRKey, void>;
  importData: MutationFetcher<Practice[], PracticeSWRKey, { data: string }>;
}

// 模擬 API 調用，實際上使用 localStorage
const practiceAPI: PracticeAPIType = {
  create: async (_, { arg }) => {
    // 驗證輸入資料
    const validatedArg = createPracticeSchema.parse(arg);

    const { PracticeStorage } = await import('./storage');
    const { generateId } = await import('./utils');

    const now = new Date().toISOString();
    const newPractice: Practice = {
      id: generateId(),
      title: validatedArg.title,
      description: validatedArg.description,
      contentType: validatedArg.contentType,
      totalAmount: validatedArg.totalAmount,
      currentProgress: 0,
      unit: getContentTypeUnit(validatedArg.contentType),
      startDate: now.split('T')[0], // YYYY-MM-DD
      targetDate: validatedArg.targetDate,
      status: 'active',
      motivationType: validatedArg.motivationType,
      customMotivation: validatedArg.customMotivation,
      isPublic: true,
      reminderEnabled: validatedArg.reminderEnabled,
      reminderFrequency: validatedArg.reminderFrequency,
      streak: 0,
      lastCheckinDate: undefined,
      smallGoals: validatedArg.smallGoals?.map((goal) => ({
        id: generateId(),
        content: goal.content,
        isCompleted: goal.isCompleted,
        order: goal.order,
        completedAt: goal.isCompleted ? now : undefined
      })) || [],
      resources: validatedArg.resources?.map((resource) => ({
        id: generateId(),
        name: resource.name,
        url: resource.url,
        type: resource.type,
        description: resource.description,
        order: resource.order
      })) || [],
      checkIns: [],
      tags: validatedArg.tags || [],
      dailyGoal: validatedArg.dailyGoal,
      createdAt: now,
      updatedAt: now
    };

    const practices = await PracticeStorage.load();
    const updatedPractices = [newPractice, ...practices];
    await PracticeStorage.save(updatedPractices);

    return newPractice;
  },

  update: async (_, { arg: { id, ...updates } }) => {
    // 驗證輸入資料
    const validatedUpdates = updatePracticeSchema.parse(updates);

    const { PracticeStorage } = await import('./storage');

    const practices = await PracticeStorage.load();
    const practice = practices.find((p) => p.id === id);

    if (!practice) {
      throw new Error('找不到指定的實踐');
    }

    const updatedPractice = {
      ...practice,
      ...validatedUpdates,
      updatedAt: new Date().toISOString()
    };

    const updatedPractices = practices.map((p) =>
      p.id === id ? updatedPractice : p
    );

    await PracticeStorage.save(updatedPractices);
    return updatedPractice;
  },

  delete: async (_, { arg: { id } }) => {
    const { PracticeStorage } = await import('./storage');

    const practices = await PracticeStorage.load();
    const updatedPractices = practices.filter((p) => p.id !== id);
    await PracticeStorage.save(updatedPractices);
  },

  checkIn: async (_, { arg }) => {
    // 驗證輸入資料
    const validatedArg = checkInInputSchema.parse(arg);

    const { PracticeStorage } = await import('./storage');
    const { CheckInService } = await import('./checkIn');

    const practices = await PracticeStorage.load();
    const practice = practices.find((p) => p.id === validatedArg.practiceId);

    if (!practice) {
      throw new Error('找不到指定的實踐');
    }

    // 驗證簽到輸入
    const validation = CheckInService.validateCheckInInput(practice, validatedArg);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // 建立簽到記錄
    const checkInRecord = CheckInService.createCheckIn(practice, validatedArg);

    // 計算新的連續天數
    const updatedCheckIns = [...practice.checkIns, checkInRecord];
    const newStreak = CheckInService.calculateStreak({ ...practice, checkIns: updatedCheckIns });

    // 更新實踐
    const newProgress = practice.currentProgress + validatedArg.progress;
    const newStatus = newProgress >= practice.totalAmount ? 'completed' : practice.status;

    const updatedPractice: Practice = {
      ...practice,
      currentProgress: newProgress,
      streak: newStreak,
      lastCheckinDate: checkInRecord.date,
      status: newStatus,
      checkIns: updatedCheckIns,
      updatedAt: new Date().toISOString()
    };

    const updatedPractices = practices.map((p) =>
      p.id === validatedArg.practiceId ? updatedPractice : p
    );

    await PracticeStorage.save(updatedPractices);
    return checkInRecord;
  },

  exportData: async () => {
    const { PracticeStorage } = await import('./storage');
    const practices = await PracticeStorage.load();
    return PracticeStorage.exportData(practices);
  },

  importData: async (_, { arg: { data } }) => {
    const { PracticeStorage } = await import('./storage');
    const practices = await PracticeStorage.importData(data);
    await PracticeStorage.save(practices);
    return practices;
  }
};

export default practiceAPI;
