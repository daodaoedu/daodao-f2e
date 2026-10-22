import { addDays, addMinutes, addMonths, endOfDay, min } from "date-fns";

export const DeliveryOption = {
  sevenDays: "7d",
  fourteenDays: "14d",
  oneMonth: "1m",
  custom: "custom",
} as const;
export type DeliveryOptionType = (typeof DeliveryOption)[keyof typeof DeliveryOption];

export interface IFutureLetterFormValues {
  currentSelf: string;
  message: string;
  deliveryOption: DeliveryOptionType;
  customDeliveryDate?: Date;
}

export interface IFutureLetterFormErrors {
  content?: "required";
  deliverAt?: "required";
}

export function hasFutureLetterContent(
  values: Pick<IFutureLetterFormValues, "currentSelf" | "message">
): boolean {
  return Boolean(values.currentSelf.trim() || values.message.trim());
}

export type DraftCloseAction = "skip" | "create" | "update" | "delete";

export function getDraftCloseAction(
  values: Pick<IFutureLetterFormValues, "currentSelf" | "message">,
  draftId: string | undefined
): DraftCloseAction {
  if (!hasFutureLetterContent(values)) return draftId ? "delete" : "skip";
  return draftId ? "update" : "create";
}

export function getFutureLetterFormErrors(
  values: IFutureLetterFormValues
): IFutureLetterFormErrors {
  const errors: IFutureLetterFormErrors = {};
  if (!hasFutureLetterContent(values)) {
    errors.content = "required";
  }

  if (values.deliveryOption === DeliveryOption.custom && !values.customDeliveryDate) {
    errors.deliverAt = "required";
  }
  return errors;
}

export function getFutureLetterCustomDateRange(now: Date): { minDate: Date; maxDate: Date } {
  return { minDate: addDays(now, 3), maxDate: addDays(now, 90) };
}

export function getDeliverAt(
  deliveryOption: DeliveryOptionType,
  customDeliveryDate: Date | undefined,
  now: Date
): Date | undefined {
  if (deliveryOption === DeliveryOption.sevenDays) {
    // Leave a small buffer so server-side `now + 7d` validation cannot race the request.
    return addMinutes(addDays(now, 7), 1);
  }
  if (deliveryOption === DeliveryOption.fourteenDays) {
    return addDays(now, 14);
  }
  if (deliveryOption === DeliveryOption.oneMonth) {
    return addMonths(now, 1);
  }
  if (!customDeliveryDate) {
    return undefined;
  }
  return min([endOfDay(customDeliveryDate), addDays(now, 90)]);
}

export function hasFutureLetterFormErrors(errors: IFutureLetterFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export type LetterDetailView = "sealed" | "unopened" | "opened";

interface LetterDetailSource {
  id: string;
  status: string;
  openedAt?: string | null;
}

/** Which detail block the footprints page shows for the selected letter. */
export function getLetterDetailView(
  letter: LetterDetailSource | null | undefined
): LetterDetailView | null {
  if (!letter) return null;
  if (letter.status === "scheduled") return "sealed";
  if (letter.status === "delivered") return letter.openedAt ? "opened" : "unopened";
  return null;
}

/**
 * Changes whenever a different detail block is shown, so the page can bring it into view
 * (the block renders after the whole timeline, far below the clicked card).
 * Stays null until the timeline has rendered: scrolling earlier (e.g. a deep link where the
 * letters load before the timeline) lands on a short page and is lost once the timeline appears.
 */
export function getLetterDetailScrollKey(
  letter: LetterDetailSource | null | undefined,
  isTimelineReady = true
): string | null {
  const view = getLetterDetailView(letter);
  return isTimelineReady && letter && view ? `${letter.id}:${view}` : null;
}
