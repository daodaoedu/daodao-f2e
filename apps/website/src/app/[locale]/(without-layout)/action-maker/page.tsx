"use client";

import { ActionMakerIntro, useActionMaker } from "@daodao/features-action-maker";

export default function ActionMakerPage() {
	const { navigateTo } = useActionMaker();
	return <ActionMakerIntro onStart={() => navigateTo("/action-maker/nickname")} />;
}
