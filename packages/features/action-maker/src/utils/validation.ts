import type { ActionLevel, CategoryType } from "../types";

const VALID_CATEGORIES: CategoryType[] = [
	"interest",
	"social",
	"health",
	"academic",
	"work",
	"finance",
];

const VALID_LEVELS: ActionLevel[] = ["beginner", "intermediate", "advanced"];

const NICKNAME_MAX_LENGTH = 20;
const TOPIC_MAX_LENGTH = 100;
const TRIGGER_TIMING_MAX_LENGTH = 100;
const CUSTOM_TITLE_MAX_LENGTH = 30;
const CUSTOM_DESCRIPTION_MAX_LENGTH = 200;

export function isValidCategory(value: unknown): value is CategoryType {
	return typeof value === "string" && VALID_CATEGORIES.includes(value as CategoryType);
}

export function isValidLevel(value: unknown): value is ActionLevel {
	return typeof value === "string" && VALID_LEVELS.includes(value as ActionLevel);
}

export function isValidNickname(value: string): boolean {
	const trimmed = value.trim();
	return trimmed.length > 0 && trimmed.length <= NICKNAME_MAX_LENGTH;
}

export function isValidTopic(value: string): boolean {
	const trimmed = value.trim();
	return trimmed.length > 0 && trimmed.length <= TOPIC_MAX_LENGTH;
}

export function isValidTriggerTiming(value: string): boolean {
	const trimmed = value.trim();
	return trimmed.length > 0 && trimmed.length <= TRIGGER_TIMING_MAX_LENGTH;
}

export function isValidCustomTitle(value: string): boolean {
	const trimmed = value.trim();
	return trimmed.length > 0 && trimmed.length <= CUSTOM_TITLE_MAX_LENGTH;
}

export function isValidCustomDescription(value: string): boolean {
	const trimmed = value.trim();
	return trimmed.length > 0 && trimmed.length <= CUSTOM_DESCRIPTION_MAX_LENGTH;
}

export const limits = {
	NICKNAME_MAX_LENGTH,
	TOPIC_MAX_LENGTH,
	TRIGGER_TIMING_MAX_LENGTH,
	CUSTOM_TITLE_MAX_LENGTH,
	CUSTOM_DESCRIPTION_MAX_LENGTH,
} as const;
