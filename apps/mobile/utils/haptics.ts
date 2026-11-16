import * as Haptics from "expo-haptics";

export const impactLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
