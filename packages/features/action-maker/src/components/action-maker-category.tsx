"use client";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@daodao/ui/components/carousel";
import { useCallback, useEffect, useState } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import type { CategoryType } from "../types";
import { categoryMap } from "../utils/category-map";
import { CategoryStar } from "./category-star";
import { NavigationButtons } from "./navigation-buttons";
import { ProgressBar } from "./progress-bar";
import { StarryBackground } from "./starry-background";

export function ActionMakerCategory() {
  const { state, dispatch, navigateTo } = useActionMaker();
  const [selected, setSelected] = useState<CategoryType>(state.userInput.category ?? "interest");
  const [selectedTags, setSelectedTags] = useState<string[]>(state.userInput.selectedTags);
  const [api, setApi] = useState<CarouselApi>();

  const categories = Array.from(categoryMap.values());
  const currentCategory = selected ? categoryMap.get(selected) : null;

  const [carouselReady, setCarouselReady] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only scroll to initial selection
  useEffect(() => {
    if (!api || !selected) return;
    const index = categories.findIndex((c) => c.id === selected);
    if (index >= 0) api.scrollTo(index, true);
    // Show carousel only after embla positions items correctly
    requestAnimationFrame(() => setCarouselReady(true));
  }, [api]);

  const handleSelect = useCallback(
    (id: CategoryType) => {
      setSelected(id);
      if (api) {
        const index = categories.findIndex((c) => c.id === id);
        if (index >= 0) api.scrollTo(index);
      }
    },
    [api, categories]
  );

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? [] : [tag]));
  };

  const handleNext = () => {
    if (!selected) return;
    dispatch({ type: "SELECT_CATEGORY", payload: selected });
    dispatch({ type: "SET_SELECTED_TAGS", payload: selectedTags });
    dispatch({ type: "SET_ACTIONS", payload: [] });
    if (selectedTags.length > 0) {
      dispatch({ type: "SET_TOPIC", payload: selectedTags.join("、") });
    }
    navigateTo("/action-maker/nickname");
  };

  const handleCustom = () => {
    if (selected) {
      dispatch({ type: "SELECT_CATEGORY", payload: selected });
      dispatch({ type: "SET_SELECTED_TAGS", payload: selectedTags });
    }
    navigateTo("/action-maker/topic");
  };

  return (
    <StarryBackground fullWidthDesktop>
      <div className="flex min-h-dvh flex-col">
        <ProgressBar current={1} />

        <div className="flex flex-1 flex-col items-center gap-6 pt-8">
          <h2 className="px-6 text-2xl font-bold text-white">你想抓住哪顆星？</h2>

          {/* Category carousel with loop */}
          <Carousel
            opts={{ loop: true, align: "center" }}
            setApi={setApi}
            className={`w-full transition-opacity duration-300 ${carouselReady ? "opacity-100" : "opacity-0"}`}
          >
            <CarouselContent className="!-ml-2">
              {categories.map((cat) => (
                <CarouselItem key={cat.id} className="basis-1/3 flex justify-center !pl-2">
                  <CategoryStar
                    category={cat}
                    isSelected={selected === cat.id}
                    onSelect={handleSelect}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Tag suggestions */}
          {currentCategory && (
            <div className="mt-4 md:mt-9 flex flex-wrap justify-center gap-2 px-6">
              {currentCategory.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-white/20 text-white"
                      : "border border-[#7B9FC4] text-[#7B9FC4] hover:text-white hover:border-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-sm">
          <NavigationButtons
            primaryLabel="下一步"
            secondaryLabel="我想自己設定"
            onPrimary={handleNext}
            onSecondary={handleCustom}
            primaryDisabled={!selected || selectedTags.length === 0}
            showRefreshIcon
          />
        </div>
      </div>
    </StarryBackground>
  );
}
