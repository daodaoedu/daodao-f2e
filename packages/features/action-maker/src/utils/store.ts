import type { IAction, IActionMakerResult, IActionMakerState } from "../types";
import { getCategoryLabel } from "./category-map";

export function buildResult(state: IActionMakerState): IActionMakerResult | null {
	const { userInput, userSelection } = state;
	if (
		!userInput.nickname ||
		!userInput.category ||
		!userSelection.action ||
		!userSelection.triggerTiming
	) {
		return null;
	}

	return {
		nickname: userInput.nickname,
		category: userInput.category,
		categoryLabel: getCategoryLabel(userInput.category),
		action: userSelection.action,
		triggerTiming: userSelection.triggerTiming,
		isCustomAction: userSelection.action.id === "custom",
	};
}

export function isCustomAction(action: IAction): boolean {
	return action.id === "custom";
}
