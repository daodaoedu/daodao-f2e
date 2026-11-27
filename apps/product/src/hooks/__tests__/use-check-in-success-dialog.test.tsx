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
  const onMoodChange = vi.fn().mockResolvedValue(true);
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
    expect(onMoodChange).not.toHaveBeenCalled();
    expect(state.config?.actions?.[0]?.disabled).toBe(false);
    expect(renderCompleteButton()).not.toContain('disabled=""');
    await state.config?.actions?.[0]?.onClick();
    expect(onMoodChange).toHaveBeenCalledExactlyOnceWith(mood);
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

  it("keeps the dialog open on save failure and retries without creating another check-in", async () => {
    const { result, onMoodChange } = setup();
    onMoodChange.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    state.selectMood?.("fine");
    const action = state.config?.actions?.[0];
    expect(await action?.onClick()).toBe(false);
    expect(state.config?.actions?.[0]?.disabled).toBe(false);
    expect(await state.config?.actions?.[0]?.onClick()).not.toBe(false);
    await expect(result).resolves.toEqual({ value: "complete", index: 0 });
    expect(onMoodChange).toHaveBeenNthCalledWith(1, "fine");
    expect(onMoodChange).toHaveBeenNthCalledWith(2, "fine");
  });

  it("blocks duplicate submission and dismissal while the mood write is pending", async () => {
    const { result, onMoodChange } = setup();
    let finish!: (success: boolean) => void;
    onMoodChange.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        })
    );
    state.selectMood?.("happy");
    const action = state.config?.actions?.[0];
    const pending = action?.onClick();
    expect(state.config?.actions?.[0]?.disabled).toBe(true);
    expect(state.config?.closeOnEscape).toBe(false);
    expect(state.config?.dismissible).toBe(false);
    expect(state.config?.showCloseButton).toBe(false);
    expect(await action?.onClick()).toBe(false);
    expect(onMoodChange).toHaveBeenCalledTimes(1);
    finish(true);
    await pending;
    await expect(result).resolves.toEqual({ value: "complete", index: 0 });
  });
});
