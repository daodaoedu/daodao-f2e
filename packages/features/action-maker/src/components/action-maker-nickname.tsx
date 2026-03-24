"use client";

import { useState } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import { isValidNickname, limits } from "../utils/validation";
import { NavigationButtons } from "./navigation-buttons";
import { ProgressBar } from "./progress-bar";
import { StarryBackground } from "./starry-background";

export function ActionMakerNickname() {
  const { state, dispatch, navigateTo } = useActionMaker();
  const [nickname, setNickname] = useState(state.userInput.nickname);

  const handleNext = () => {
    if (!isValidNickname(nickname)) return;
    dispatch({ type: "SET_NICKNAME", payload: nickname.trim() });
    navigateTo("/action-maker/actions");
  };

  return (
    <StarryBackground>
      <div className="flex min-h-dvh flex-col">
        <ProgressBar current={1} />

        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
          <h2 className="text-2xl font-bold text-white">寫下你的暱稱</h2>

          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="向你許願的星留下你的大名"
            maxLength={limits.NICKNAME_MAX_LENGTH}
            className="w-full max-w-sm rounded-xl border border-[#BCD5EE]/30 bg-[#18215E]/80 px-5 py-4 text-white placeholder:text-[#7B9FC4] focus:border-[#BCD5EE]/60 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
          />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <NavigationButtons
            primaryLabel="下一步"
            onPrimary={handleNext}
            primaryDisabled={!isValidNickname(nickname)}
          />
        </div>
      </div>
    </StarryBackground>
  );
}
