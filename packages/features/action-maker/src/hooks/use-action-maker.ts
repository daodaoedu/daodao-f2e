"use client";

import { useContext } from "react";
import { ActionMakerContext } from "../providers/action-maker-provider";

export function useActionMaker() {
	const context = useContext(ActionMakerContext);
	if (!context) {
		throw new Error("useActionMaker must be used within an ActionMakerProvider");
	}
	return context;
}
