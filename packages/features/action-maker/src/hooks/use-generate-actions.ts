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

			try {
				const apiUrl = process.env.NEXT_PUBLIC_API_URL;
				if (!apiUrl) throw new Error("API URL not configured");

				const response = await fetch(
					`${apiUrl}/api/v1/action-maker/generate`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({
							category: input.category,
							topic: input.topic,
							selectedTags: input.tags ?? [],
						}),
						signal: controller.signal,
					},
				);

				if (!response.ok) {
					throw new Error(`API returned ${response.status}`);
				}

				const responseData: { actions?: IAction[] } = await response.json();
				if (responseData.actions && responseData.actions.length > 0) {
					setActions(responseData.actions);
				} else {
					throw new Error("No actions returned from API");
				}
			} catch (err) {
				// On any API failure, fall back to static data
				if (controller.signal.aborted) return;

				const fallback = getFallbackActions(input.category);
				if (fallback.length > 0) {
					setActions(fallback);
					setIsFallback(true);
				} else {
					setError(
						err instanceof Error
							? err
							: new Error("No actions available for this category"),
					);
				}
			} finally {
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
			}
		};

		generate();

		return () => {
			controller.abort();
		};
	}, [input]);

	return { actions, isLoading, error, isFallback };
}
