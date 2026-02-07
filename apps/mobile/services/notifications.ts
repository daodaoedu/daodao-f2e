import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export interface ScheduledReminder {
  id: string
  practiceId: string
  practiceTitle: string
  time: string // HH:mm format
  enabled: boolean
}

export const notificationService = {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Notifications only work on physical devices')
      return false
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      return false
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await this.setupAndroidChannel()
    }

    return true
  },

  /**
   * Set up Android notification channel
   */
  async setupAndroidChannel(): Promise<void> {
    await Notifications.setNotificationChannelAsync('daily-reminders', {
      name: '每日提醒',
      description: '實踐打卡提醒通知',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
      sound: 'default',
    })

    await Notifications.setNotificationChannelAsync('achievements', {
      name: '成就通知',
      description: '成就解鎖和里程碑通知',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    })
  },

  /**
   * Schedule a daily reminder for a practice
   */
  async scheduleDailyReminder(
    practiceId: string,
    practiceTitle: string,
    time: string // HH:mm format
  ): Promise<string | null> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) return null

    // 驗證時間格式
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/)
    if (!timeMatch) {
      console.warn('Invalid time format:', time)
      return null
    }

    const hours = parseInt(timeMatch[1], 10)
    const minutes = parseInt(timeMatch[2], 10)

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.warn('Invalid time values:', { hours, minutes })
      return null
    }

    const trigger: Notifications.DailyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '打卡提醒 ⏰',
        body: `記得完成今天的「${practiceTitle}」`,
        data: {
          type: 'daily-reminder',
          practiceId,
        },
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'daily-reminders' }),
      },
      trigger,
    })

    return id
  },

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  },

  /**
   * Cancel all notifications for a practice
   */
  async cancelPracticeNotifications(practiceId: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync()
    const practiceNotifications = scheduled.filter(
      n => n.content.data?.practiceId === practiceId
    )

    await Promise.all(
      practiceNotifications.map(n =>
        Notifications.cancelScheduledNotificationAsync(n.identifier)
      )
    )
  },

  /**
   * Send an achievement notification
   */
  async sendAchievementNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) return

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'achievement',
          ...data,
        },
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'achievements' }),
      },
      trigger: null, // Immediate
    })
  },

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync()
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync()
  },

  /**
   * Add notification response listener
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback)
  },

  /**
   * Add notification received listener (foreground)
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback)
  },
}

// Achievement notification helpers
export const achievementNotifications = {
  async streakMilestone(streak: number): Promise<void> {
    const milestones: Record<number, string> = {
      3: '連續 3 天打卡！繼續保持！',
      7: '連續一週打卡！你太棒了！',
      14: '連續兩週！習慣正在養成中！',
      21: '21 天！恭喜你養成了新習慣！',
      30: '連續一個月！你是真正的實踐者！',
      60: '連續 60 天！令人敬佩的毅力！',
      100: '100 天連續打卡！你是傳奇！',
    }

    const message = milestones[streak]
    if (message) {
      await notificationService.sendAchievementNotification(
        '🔥 連續打卡里程碑',
        message,
        { streak }
      )
    }
  },

  async practiceCompleted(practiceTitle: string, totalDays: number): Promise<void> {
    await notificationService.sendAchievementNotification(
      '🎉 實踐完成！',
      `恭喜完成「${practiceTitle}」${totalDays} 天的目標！`,
      { practiceTitle, totalDays }
    )
  },

  async firstCheckIn(): Promise<void> {
    await notificationService.sendAchievementNotification(
      '🌟 第一次打卡',
      '恭喜完成你的第一次打卡！這是偉大旅程的開始！'
    )
  },
}
