"use client";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@daodao/ui/components/carousel";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import { useGenerateActions } from "../hooks/use-generate-actions";
import { useRefineAction } from "../hooks/use-refine-action";
import type { ActionLevel, IAction } from "../types";
import { getCategoryLabel } from "../utils/category-map";
import { isValidCustomDescription, isValidCustomTitle, limits } from "../utils/validation";
import { ActionCard } from "./action-card";
import { ActionLoading } from "./action-loading";
import { NavigationButtons } from "./navigation-buttons";
import { ProgressBar } from "./progress-bar";
import { StarryBackground } from "./starry-background";

type RefineState = "selecting-level" | "filling" | "refining" | "comparing";

const LEVEL_OPTIONS: {
  value: ActionLevel;
  label: string;
  desc: string;
}[] = [
  { value: "beginner", label: "初學", desc: "簡單、低門檻、5-20 分鐘" },
  { value: "intermediate", label: "中級", desc: "適度挑戰、20-60 分鐘" },
  { value: "advanced", label: "進階", desc: "高投入、40 分鐘以上" },
];

export function ActionMakerActions() {
  const { state, dispatch, navigateTo } = useActionMaker();
  const { userInput, generatedActions: existingActions } = state;

  // Only call API if we don't already have actions (e.g. coming back from detail via replace)
  const apiInput = useMemo(
    () =>
      existingActions.length > 0 || !userInput.category
        ? null
        : {
            category: userInput.category,
            topic: userInput.topic,
            tags: userInput.selectedTags,
          },
    [existingActions.length, userInput.category, userInput.topic, userInput.selectedTags]
  );

  const {
    actions: apiActions,
    isLoading,
    error: generateError,
    sessionId,
  } = useGenerateActions(apiInput);
  const actions = existingActions.length > 0 ? existingActions : (apiActions ?? []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customDuration, setCustomDuration] = useState("");

  // New state for refine flow
  const [customLevel, setCustomLevel] = useState<ActionLevel | null>(null);
  const [refineState, setRefineState] = useState<RefineState>("selecting-level");
  const [originalCustomAction, setOriginalCustomAction] = useState<IAction | null>(null);

  const { refinedAction, isRefining, refineError, refine, reset: resetRefine } = useRefineAction();

  const categoryLabel = userInput.category ? getCategoryLabel(userInput.category) : "";

  // Store API actions in context when they arrive
  useEffect(() => {
    if (apiActions && apiActions.length > 0 && existingActions.length === 0) {
      dispatch({ type: "SET_ACTIONS", payload: apiActions });
    }
  }, [apiActions, existingActions.length, dispatch]);

  // Store session ID in context when it arrives
  useEffect(() => {
    if (sessionId) {
      dispatch({ type: "SET_SESSION_ID", payload: sessionId });
    }
  }, [sessionId, dispatch]);

  // Sync carousel scroll with selectedIndex
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Transition to comparing when refine completes
  useEffect(() => {
    if (!isRefining && (refinedAction || refineError) && refineState === "refining") {
      setRefineState("comparing");
    }
  }, [isRefining, refinedAction, refineError, refineState]);

  const handleCardSelect = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      carouselApi?.scrollTo(index);
    },
    [carouselApi]
  );

  const handleSelectAction = () => {
    const action = actions[selectedIndex];
    if (!action || action.locked) return;
    dispatch({ type: "SELECT_ACTION", payload: action });
    navigateTo("/action-maker/detail");
  };

  const handleOpenCustomForm = () => {
    setShowCustomForm(true);
    setRefineState("selecting-level");
    setCustomLevel(null);
    setCustomTitle("");
    setCustomDescription("");
    setCustomDuration("");
    resetRefine();
  };

  const handleLevelSelect = (level: ActionLevel) => {
    setCustomLevel(level);
    setRefineState("filling");
  };

  const buildCustomAction = (): IAction => ({
    id: "custom",
    categoryId: userInput.category ?? "interest",
    level: customLevel ?? "beginner",
    title: customTitle.trim(),
    description: customDescription.trim(),
    duration: customDuration.trim() || null,
    tip: null,
    rationale: null,
  });

  const handleDirectSubmit = () => {
    if (!isValidCustomTitle(customTitle) || !isValidCustomDescription(customDescription)) return;
    const customAction = buildCustomAction();
    dispatch({ type: "SELECT_ACTION", payload: customAction });
    navigateTo("/action-maker/detail");
  };

  const handleRefineSubmit = async () => {
    if (!isValidCustomTitle(customTitle)) return;

    const action = buildCustomAction();
    setOriginalCustomAction(action);
    setRefineState("refining");

    await refine({
      category: userInput.category ?? "interest",
      topic: userInput.topic,
      level: customLevel ?? "beginner",
      title: customTitle.trim(),
      description: customDescription.trim() || undefined,
      session_id: state.sessionId ?? undefined,
    });
  };

  const handleAdoptRefined = () => {
    if (!refinedAction) return;
    dispatch({ type: "SET_USED_REFINE", payload: true });
    dispatch({ type: "SELECT_ACTION", payload: refinedAction });
    navigateTo("/action-maker/detail");
  };

  const handleEditRefined = () => {
    if (!refinedAction) return;
    // Pre-fill form with AI content
    setCustomTitle(refinedAction.title ?? "");
    setCustomDescription(refinedAction.description ?? "");
    setCustomDuration(refinedAction.duration ?? "");
    setRefineState("filling");
  };

  const handleUseOriginal = () => {
    if (!originalCustomAction) return;
    dispatch({ type: "SELECT_ACTION", payload: originalCustomAction });
    navigateTo("/action-maker/detail");
  };

  const isFormValid =
    isValidCustomTitle(customTitle) && isValidCustomDescription(customDescription);

  // Loading state
  if (isLoading) {
    return (
      <StarryBackground fullWidthDesktop>
        <ActionLoading categoryLabel={categoryLabel} />
      </StarryBackground>
    );
  }

  // Error state (no actions and no fallback)
  if (!isLoading && actions.length === 0 && generateError) {
    return (
      <StarryBackground fullWidthDesktop>
        <div className="flex min-h-dvh flex-col">
          <ProgressBar current={2} />
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
            <h2 className="text-xl font-bold text-white">生成失敗</h2>
            <p className="text-center text-[#BCD5EE]">抱歉，目前無法生成行動建議，請稍後再試。</p>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <NavigationButtons
              primaryLabel="重新嘗試"
              secondaryLabel="我想自己設定"
              onPrimary={() => navigateTo("/action-maker/category", { replace: true })}
              onSecondary={handleOpenCustomForm}
            />
          </div>
        </div>
      </StarryBackground>
    );
  }

  // Custom form flow
  if (showCustomForm) {
    return (
      <StarryBackground fullWidthDesktop>
        <div className="flex min-h-dvh flex-col">
          <ProgressBar current={2} />

          {/* View 1: Level Selection */}
          {refineState === "selecting-level" && (
            <>
              <div className="w-full md:max-w-[85%] md:mx-auto flex flex-1 flex-col gap-5 px-6 pt-8">
                <h2 className="text-xl font-bold text-white">選擇行動強度</h2>
                <div className="flex flex-col gap-3">
                  {LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleLevelSelect(opt.value)}
                      className={`rounded-xl border px-5 py-4 text-left transition-all duration-200 ${
                        customLevel === opt.value
                          ? "border-[#BCD5EE]/60 bg-[#18215E]/80"
                          : "border-[#BCD5EE]/30 bg-[#18215E]/80 hover:border-[#BCD5EE]/50"
                      }`}
                    >
                      <span className="block text-base font-medium text-white">{opt.label}</span>
                      <span className="mt-1 block text-sm text-[#7B9FC4]">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mx-auto w-full max-w-sm">
                <NavigationButtons
                  primaryLabel="返回建議"
                  onPrimary={() => setShowCustomForm(false)}
                />
              </div>
            </>
          )}

          {/* View 2: Form */}
          {refineState === "filling" && (
            <>
              <div className="w-full md:max-w-[85%] md:mx-auto flex flex-1 flex-col gap-5 px-6 pt-8">
                <h2 className="text-xl font-bold text-white">自訂你的行動</h2>

                <label className="block">
                  <span className="mb-1 block text-sm text-[#7B9FC4]">行動標題</span>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    maxLength={limits.CUSTOM_TITLE_MAX_LENGTH}
                    placeholder="例如：練習烏克麗麗和弦"
                    className="w-full rounded-xl border border-[#BCD5EE]/30 bg-[#18215E]/80 px-4 py-3 text-white placeholder:text-[#7B9FC4] focus:border-[#BCD5EE]/60 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm text-[#7B9FC4]">具體行動內容</span>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    maxLength={limits.CUSTOM_DESCRIPTION_MAX_LENGTH}
                    rows={4}
                    placeholder="例如：每天花 15 分鐘練習 C、G、Am、F 四個和弦的轉換"
                    className="w-full resize-none rounded-xl border border-[#BCD5EE]/30 bg-[#18215E]/80 px-4 py-3 text-white placeholder:text-[#7B9FC4] focus:border-[#BCD5EE]/60 focus:outline-none"
                  />
                  <span className="mt-1 block text-right text-xs text-[#7B9FC4]">
                    {customDescription.length} / {limits.CUSTOM_DESCRIPTION_MAX_LENGTH}
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm text-[#7B9FC4]">預估時間（選填）</span>
                  <input
                    type="text"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="例如：約 15 分鐘"
                    className="w-full rounded-xl border border-[#BCD5EE]/30 bg-[#18215E]/80 px-4 py-3 text-white placeholder:text-[#7B9FC4] focus:border-[#BCD5EE]/60 focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 px-6 pb-8 pt-4 mx-auto w-full max-w-sm">
                {/* Primary: AI refine */}
                <div className="relative">
                  {isFormValid && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-full"
                      style={{
                        boxShadow:
                          "6px -4px 24px -4px rgba(80, 120, 255, 0.5), -6px 6px 24px -4px rgba(211, 90, 255, 0.5)",
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleRefineSubmit}
                    disabled={!isFormValid}
                    className={`relative w-full rounded-full border border-[#7B8DB8] py-4 text-base font-medium transition-all duration-300 ${
                      !isFormValid
                        ? "cursor-not-allowed text-white/30"
                        : "text-[#18215E] hover:text-white"
                    }`}
                    style={{
                      background: !isFormValid
                        ? "linear-gradient(to right, rgba(74,85,120,0.5), rgba(107,120,152,0.4) 50%, rgba(74,85,120,0.5))"
                        : "radial-gradient(60% 100% at 90% 30%, rgba(107, 173, 224, 0.45) 0%, rgba(107, 173, 224, 0) 100%), radial-gradient(50% 100% at 10% 100%, rgba(211, 160, 255, 0.45) 0%, rgba(211, 160, 255, 0) 100%), white",
                    }}
                  >
                    AI 幫我完善
                  </button>
                </div>

                {/* Secondary: direct use */}
                <button
                  type="button"
                  onClick={handleDirectSubmit}
                  disabled={!isFormValid}
                  className={`flex w-full items-center justify-center gap-2 rounded-full border py-4 text-base transition-all duration-300 ${
                    !isFormValid
                      ? "cursor-not-allowed border-white/20 text-white/30"
                      : "border-white/50 text-white hover:border-white/70 hover:bg-white/10"
                  }`}
                >
                  直接使用
                </button>

                {/* Back to level selection */}
                <button
                  type="button"
                  onClick={() => setRefineState("selecting-level")}
                  className="mt-1 text-center text-sm text-[#7B9FC4] hover:text-[#BCD5EE] transition-colors"
                >
                  返回選擇強度
                </button>
              </div>
            </>
          )}

          {/* View 3: Refining */}
          {refineState === "refining" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
              <Loader2 className="h-10 w-10 animate-spin text-[#BCD5EE]" />
              <p className="text-lg text-[#BCD5EE]">AI 正在幫你完善行動...</p>
            </div>
          )}

          {/* View 4: Comparison */}
          {refineState === "comparing" && (
            <>
              <div className="w-full md:max-w-[85%] md:mx-auto flex flex-1 flex-col gap-5 px-6 pt-8">
                {refineError ? (
                  <>
                    <h2 className="text-xl font-bold text-white">AI 完善失敗</h2>
                    <p className="text-sm text-[#7B9FC4]">{refineError.message}</p>
                    <p className="text-sm text-[#BCD5EE]">你可以使用你原本設定的行動。</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-white">AI 幫你完善的行動</h2>
                    {refinedAction && (
                      <div className="flex justify-center">
                        <ActionCard action={refinedAction} isSelected onSelect={() => {}} />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3 px-6 pb-8 pt-4 mx-auto w-full max-w-sm">
                {!refineError && (
                  <>
                    {/* Primary: adopt AI version */}
                    <div className="relative">
                      <div
                        className="pointer-events-none absolute inset-0 rounded-full"
                        style={{
                          boxShadow:
                            "6px -4px 24px -4px rgba(80, 120, 255, 0.5), -6px 6px 24px -4px rgba(211, 90, 255, 0.5)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAdoptRefined}
                        className="relative w-full rounded-full border border-[#7B8DB8] py-4 text-base font-medium text-[#18215E] transition-all duration-300 hover:text-white"
                        style={{
                          background:
                            "radial-gradient(60% 100% at 90% 30%, rgba(107, 173, 224, 0.45) 0%, rgba(107, 173, 224, 0) 100%), radial-gradient(50% 100% at 10% 100%, rgba(211, 160, 255, 0.45) 0%, rgba(211, 160, 255, 0) 100%), white",
                        }}
                      >
                        採用 AI 版本
                      </button>
                    </div>

                    {/* Secondary: edit */}
                    <button
                      type="button"
                      onClick={handleEditRefined}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-white/50 py-4 text-base text-white transition-all duration-300 hover:border-white/70 hover:bg-white/10"
                    >
                      自己修改
                    </button>
                  </>
                )}

                {/* Tertiary / fallback: use original */}
                <button
                  type="button"
                  onClick={handleUseOriginal}
                  className="mt-1 text-center text-sm text-[#7B9FC4] hover:text-[#BCD5EE] transition-colors"
                >
                  用我原本的
                </button>
              </div>
            </>
          )}
        </div>
      </StarryBackground>
    );
  }

  // Loaded — action cards carousel
  return (
    <StarryBackground fullWidthDesktop>
      <div className="flex min-h-dvh flex-col">
        <ProgressBar current={2} />

        <div className="w-full flex flex-1 flex-col gap-6 pt-8">
          <div className="px-6 text-center">
            <h2 className="text-xl font-bold text-white">這是你的每日具體行動</h2>
            <p className="mt-2 text-[#BCD5EE]">
              {categoryLabel}：{userInput.topic}
            </p>
          </div>

          {/* Carousel */}
          <Carousel
            opts={{ loop: true, align: "center" }}
            setApi={setCarouselApi}
            className="w-full px-6 md:px-[60px] [&>div]:overflow-visible"
          >
            <CarouselContent className="-ml-8">
              {actions.map((action, i) => (
                <CarouselItem key={action.id} className="basis-[312px] flex justify-center pl-8">
                  <ActionCard
                    action={action}
                    isSelected={selectedIndex === i}
                    onSelect={() => handleCardSelect(i)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <NavigationButtons
            primaryLabel="看起來很棒"
            secondaryLabel="我想自己設定"
            onPrimary={handleSelectAction}
            onSecondary={handleOpenCustomForm}
            primaryDisabled={!actions[selectedIndex] || !!actions[selectedIndex]?.locked}
            showRefreshIcon
          />
        </div>
      </div>
    </StarryBackground>
  );
}
