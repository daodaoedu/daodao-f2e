/** 六大分類 */
export type CategoryType =
	| "interest"
	| "social"
	| "health"
	| "academic"
	| "work"
	| "finance";

/** 行動等級 */
export type ActionLevel = "beginner" | "intermediate" | "advanced";

/** 分類資訊 */
export interface ICategory {
	id: CategoryType;
	label: string;
	icon: React.ComponentType<Omit<React.SVGProps<SVGSVGElement>, "ref">>;
	tags: string[];
}

/** 行動建議（由後端 API 回傳） */
export interface IAction {
	id: string;
	categoryId: CategoryType;
	level: ActionLevel;
	locked?: boolean;
	title: string | null;
	description: string | null;
	duration: string | null;
	tip: string | null;
	rationale: string | null;
}

/** 使用者填寫的資料 */
export interface IUserInput {
	nickname: string;
	topic: string;
	category: CategoryType | null;
	selectedTags: string[];
}

/** 使用者最終選擇 */
export interface IUserSelection {
	action: IAction | null;
	triggerTiming: string;
}

/** Action Maker 完整狀態 */
export interface IActionMakerState {
	userInput: IUserInput;
	userSelection: IUserSelection;
	generatedActions: IAction[];
}

/** 結果資料 */
export interface IActionMakerResult {
	nickname: string;
	category: CategoryType;
	categoryLabel: string;
	action: IAction;
	triggerTiming: string;
	isCustomAction: boolean;
}
