import type { DialogConfig } from "@daodao/ui/components/animate-ui/components/radix/dialog-manager";
import { Button } from "@daodao/ui/components/button";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHECK_IN_MOOD_OPTIONS } from "@/constants/mood";
import { useCheckInSuccessDialog } from "../use-check-in-success-dialog";

const state = vi.hoisted(() => ({
  config: undefined as DialogConfig | undefined,
  selectMood: undefined as ((value: string) => void) | undefined,
  open: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@daodao/i18n", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@daodao/i18n/navigation", () => ({ useRouter: () => ({ back: vi.fn() }) }));
vi.mock("@daodao/ui/components/animate-ui/components/radix/dialog", () => ({
  useDialogManager: () => ({ open: state.open, update: state.update }),
}));
vi.mock("@daodao/ui/components/radio-group", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@daodao/ui/components/radio-group")>();
  return {
    ...actual,
    RadioGroup: (props: React.ComponentProps<typeof actual.RadioGroup>) => {
      state.selectMood = props.onValueChange;
      return createElement(actual.RadioGroup, props);
    },
  };
});

function setup() {
  let openSuccessDialog!: ReturnType<typeof useCheckInSuccessDialog>["openSuccessDialog"];
  function Probe() {
    openSuccessDialog = useCheckInSuccessDialog({}).openSuccessDialog;
    return null;
  }
  renderToStaticMarkup(<Probe />);
  const onMoodChange = vi.fn();
  const result = openSuccessDialog(25, 50, undefined, onMoodChange);
  const markup = renderToStaticMarkup(state.config?.content);
  return { result, markup, onMoodChange };
}

function renderCompleteButton() {
  const action = state.config?.actions?.[0];
  if (!action) throw new Error("Missing completion action");
  const { label, ...props } = action;
  return renderToStaticMarkup(<Button {...props}>{label}</Button>);
}

beforeEach(() => {
  vi.clearAllMocks();
  state.config = undefined;
  state.selectMood = undefined;
  state.open.mockImplementation((config: DialogConfig) => {
    state.config = config;
    return { id: "success-dialog", close: vi.fn() };
  });
  state.update.mockImplementation((id: string, config: Partial<DialogConfig>) => {
    expect(id).toBe("success-dialog");
    if (!state.config) throw new Error("Cannot update a dialog before it is opened");
    state.config = { ...state.config, ...config };
  });
});

describe("check-in success mood requirement", () => {
  it("starts with all five moods unselected and the native Complete button disabled", async () => {
    const { markup, result, onMoodChange } = setup();
    expect(markup).toContain("mood_follow_up_title");
    expect(markup.match(/aria-checked="false"/g)).toHaveLength(5);
    expect(markup).not.toContain('aria-checked="true"');
    expect(renderCompleteButton()).toContain('disabled=""');
    expect(onMoodChange).not.toHaveBeenCalled();
    state.config?.onClose?.();
    await expect(result).resolves.toEqual({ value: "close", index: -1 });
  });

  it.each(
    CHECK_IN_MOOD_OPTIONS.map(({ id }) => id)
  )("enables Complete after selecting %s, including neutral", async (mood) => {
    const { result, onMoodChange } = setup();
    expect(state.selectMood).toBeTypeOf("function");
    state.selectMood?.(mood);
    expect(onMoodChange).toHaveBeenCalledExactlyOnceWith(mood);
    expect(state.config?.actions?.[0]?.disabled).toBe(false);
    expect(renderCompleteButton()).not.toContain('disabled=""');
    await state.config?.actions?.[0]?.onClick();
    state.config?.onClose?.();
    await expect(result).resolves.toEqual({ value: "complete", index: 0 });
  });

  it("resets the requirement when a new success dialog is opened", async () => {
    const first = setup();
    state.selectMood?.("happy");
    state.config?.onClose?.();
    await first.result;
    const second = setup();
    expect(second.markup).not.toContain('aria-checked="true"');
    expect(renderCompleteButton()).toContain('disabled=""');
    state.config?.onClose?.();
    await second.result;
  });
});
