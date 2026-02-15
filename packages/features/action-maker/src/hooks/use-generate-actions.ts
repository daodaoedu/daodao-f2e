"use client";

import { useEffect, useRef, useState } from "react";
import type { CategoryType, IAction } from "../types";
import { getFallbackActions } from "../utils/fallback-actions";

interface UseGenerateActionsInput {
	category: CategoryType;
	topic: string;
	tags?: string[];
}

interface UseGenerateActionsReturn {
	actions: IAction[] | null;
	isLoading: boolean;
	error: Error | null;
	isFallback: boolean;
}

/**
 * Hook to call the backend API to generate personalized action suggestions.
 * Falls back to static data on failure.
 *
 * NOTE: When the backend API is ready, replace the fetch call with
 * `client.POST("/api/v1/action-maker/generate", ...)` from `@daodao/api`.
 */
export function useGenerateActions(
	input: UseGenerateActionsInput | null,
): UseGenerateActionsReturn {
	const [actions, setActions] = useState<IAction[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [isFallback, setIsFallback] = useState(false);
	const hasRequested = useRef(false);

	useEffect(() => {
		if (!input || hasRequested.current) return;
		hasRequested.current = true;

		setIsLoading(true);
		setError(null);
		setIsFallback(false);

		// TODO: Replace with actual API call when backend is ready:
		// client.POST("/api/v1/action-maker/generate", {
		//   body: { category: input.category, topic: input.topic, selectedTags: input.tags },
		//   signal: controller.signal,
		// })

		// For now, simulate API call with fallback data + delay
		const timer = setTimeout(() => {
			const fallback = getFallbackActions(input.category);
			if (fallback.length > 0) {
				setActions(fallback);
				setIsFallback(true);
			} else {
				setError(new Error("No actions available for this category"));
			}
			setIsLoading(false);
		}, 1500);

		return () => {
			clearTimeout(timer);
		};
	}, [input]);

	return { actions, isLoading, error, isFallback };
}
