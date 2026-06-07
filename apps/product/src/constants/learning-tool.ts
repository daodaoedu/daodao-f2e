export const LearningTool = {
  video: "video",
  reading: "reading",
  project: "project",
  community: "community",
  oneOnOne: "oneOnOne",
  gamification: "gamification",
} as const;

export type LearningTool = (typeof LearningTool)[keyof typeof LearningTool];

export const LEARNING_TOOL_OPTIONS = [
  { value: LearningTool.video, labelKey: "learning_tool_video", icon: "Video" },
  { value: LearningTool.reading, labelKey: "learning_tool_reading", icon: "BookOpen" },
  { value: LearningTool.project, labelKey: "learning_tool_project", icon: "Hammer" },
  { value: LearningTool.community, labelKey: "learning_tool_community", icon: "Users" },
  { value: LearningTool.oneOnOne, labelKey: "learning_tool_one_on_one", icon: "MessageCircle" },
  {
    value: LearningTool.gamification,
    labelKey: "learning_tool_gamification",
    icon: "Gamepad2",
  },
] as const;
