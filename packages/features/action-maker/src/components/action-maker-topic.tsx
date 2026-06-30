"use client";

import { useState } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import { isValidTopic, limits } from "../utils/validation";
import { NavigationButtons } from "./navigation-buttons";
import { ProgressBar } from "./progress-bar";
import { StarryBackground } from "./starry-background";

export function ActionMakerTopic() {
  const { state, dispatch, navigateTo } = useActionMaker();
  const [topic, setTopic] = useState(state.userInput.topic);

  const handleNext = () => {
    if (!isValidTopic(topic)) return;
    dispatch({ type: "SET_TOPIC", payload: topic.trim() });
    dispatch({ type: "SET_SELECTED_TAGS", payload: [] });
    dispatch({ type: "SET_ACTIONS", payload: [] });
    navigateTo("/action-maker/nickname");
  };

  const handleInspiration = () => {
    dispatch({ type: "SET_TOPIC", payload: topic.trim() });
    navigateTo("/action-maker/category");
  };

  return (
    <StarryBackground>
      <div className="flex min-h-dvh flex-col">
        <ProgressBar current={1} />

        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
          <h2 className="text-2xl font-bold text-white">設定你感興趣的主題</h2>
          <p className="text-[#BCD5EE]">我想要...</p>

          <div className="w-full max-w-sm">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：閱讀原子習慣、學會鉤針、開始存美股..."
              maxLength={limits.TOPIC_MAX_LENGTH}
              rows={5}
              className="w-full resize-none rounded-xl border border-[#BCD5EE]/30 bg-[#18215E]/80 px-5 py-4 text-white placeholder:text-[#7B9FC4] focus:border-[#BCD5EE]/60 focus:outline-none"
            />
            <div className="mt-1 text-right text-xs text-[#7B9FC4]">
              {topic.length} / {limits.TOPIC_MAX_LENGTH}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <NavigationButtons
            primaryLabel="下一步"
            secondaryLabel="給我一些靈感"
            onPrimary={handleNext}
            onSecondary={handleInspiration}
            primaryDisabled={!isValidTopic(topic)}
          />
        </div>
      </div>
    </StarryBackground>
  );
}
