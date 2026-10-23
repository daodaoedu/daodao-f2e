/** 打卡成功對話框進度條動畫每個 render 要做的事 */
export type ProgressAnimationAction = "idle" | "finish" | "tick";

interface ProgressAnimationState {
  /** 目前顯示的百分比 */
  percentage: number;
  /** 打卡前進度 */
  from: number;
  /** 打卡後進度 */
  to: number;
  /** 文字動畫結束、可以開始跑進度 */
  started: boolean;
  /** 已觸發過完成 */
  finished: boolean;
}

export function getProgressAnimationAction({
  percentage,
  from,
  to,
  started,
  finished,
}: ProgressAnimationState): ProgressAnimationAction {
  if (!started || finished) return "idle";
  // 打卡前後進度相同（例如封頂 999%）或倒退時沒有可累加的距離，直接結束；
  // 否則對話框的白色覆蓋層不會淡出，會一直蓋住鼓勵文字與「完成」按鈕（daodao#372）
  if (from >= to || percentage >= to) return "finish";
  return "tick";
}
