/** 停留未滿這個秒數不回報 */
const MIN_REPORT_SECONDS = 5;

export interface TimeSpentReporterOptions {
  now: () => number;
  post: (seconds: number) => void;
}

export interface TimeSpentReporter {
  /** 回報從建立到現在的停留秒數（未滿門檻或已 stop 則略過） */
  send: () => void;
  /** 之後不再回報（例如實踐已刪除，再送會 404；daodao#369） */
  stop: () => void;
}

export function createTimeSpentReporter({
  now,
  post,
}: TimeSpentReporterOptions): TimeSpentReporter {
  const startedAt = now();
  let stopped = false;

  return {
    send() {
      if (stopped) return;
      const seconds = Math.round((now() - startedAt) / 1000);
      if (seconds < MIN_REPORT_SECONDS) return;
      post(seconds);
    },
    stop() {
      stopped = true;
    },
  };
}
