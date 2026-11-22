import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICheckInFormData } from "../../../types";
import { useCheckInSubmit } from "../use-check-in-submit";

const state = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  toastError: vi.fn(),
  selected: "happy",
  result: "close",
}));
vi.mock("@daodao/api", () => ({
  useCreatePracticeCheckIn: () => ({ createCheckIn: state.create }),
  useUpdatePracticeCheckIn: () => ({ updateCheckIn: state.update }),
}));
vi.mock("@daodao/i18n", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@daodao/ui/components/sonner", () => ({
  toast: { loading: vi.fn(), dismiss: vi.fn(), error: state.toastError },
}));
vi.mock("@/lib/server-error/use-server-error-message", () => ({
  useServerErrorMessage: () => ({ errorMessage: () => "failed" }),
}));
vi.mock("@/hooks/use-check-in-success-dialog", () => ({
  useCheckInSuccessDialog: () => ({
    openSuccessDialog: async (
      _from: number,
      _to: number,
      _enc: string,
      _initial: string,
      onMood: (mood: string) => void
    ) => {
      onMood(state.selected);
      return { value: state.result, index: state.result === "complete" ? 0 : -1 };
    },
  }),
}));

const form: ICheckInFormData = { mood: "neutral", tags: [], description: "完成練習", media: [] };
function setup() {
  const onComplete = vi.fn();
  let submit: ReturnType<typeof useCheckInSubmit>["submitCheckIn"];
  function Probe() {
    submit = useCheckInSubmit({ practiceId: "practice-id", onComplete }).submitCheckIn;
    return null;
  }
  renderToStaticMarkup(<Probe />);
  return { submit: () => submit(form), onComplete };
}
beforeEach(() => {
  vi.clearAllMocks();
  state.create.mockResolvedValue({ data: { id: 42 } });
  state.update.mockResolvedValue({ data: {} });
  state.selected = "happy";
  state.result = "close";
});

describe("post-create selected mood persistence", () => {
  it.each([
    "complete",
    "close",
  ])("persists the last selected mood exactly once on %s", async (result) => {
    state.result = result;
    const { submit, onComplete } = setup();
    await submit();
    expect(state.create).toHaveBeenCalledTimes(1);
    expect(state.update).toHaveBeenCalledExactlyOnceWith({ mood: "happy" }, "42");
    expect(onComplete).toHaveBeenCalledExactlyOnceWith({ ...form, mood: "happy" });
  });
  it("does not patch an unchanged selection", async () => {
    state.selected = "neutral";
    const { submit, onComplete } = setup();
    await submit();
    expect(state.update).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith(form);
  });
  it("shows persistence failure and reports the actually saved initial mood", async () => {
    state.update.mockRejectedValueOnce(new Error("write rejected"));
    const { submit, onComplete } = setup();
    await submit();
    expect(state.update).toHaveBeenCalledTimes(1);
    expect(state.toastError).toHaveBeenCalledWith("mood_update_failed");
    expect(onComplete).toHaveBeenCalledWith(form);
  });
});
