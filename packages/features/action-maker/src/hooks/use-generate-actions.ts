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
 * Falls back to static data on API failure or when backend is not available.
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

		const controller = new AbortController();

		const generate = async () => {
			setIsLoading(true);
			setError(null);
			setIsFallback(false);

			// TODO: restore API call when backend is ready
			// Mock: simulate loading delay then use fallback data
			await new Promise((r) => setTimeout(r, 800));
			if (controller.signal.aborted) return;

			const fallback = getFallbackActions(input.category);
			if (fallback.length > 0) {
				setActions(fallback);
				setIsFallback(true);
			} else {
				setError(new Error("No actions available for this category"));
			}
			setIsLoading(false);
		};

		generate();

		return () => {
			controller.abort();
			hasRequested.current = false;
		};
	}, [input]);

	return { actions, isLoading, error, isFallback };
}
