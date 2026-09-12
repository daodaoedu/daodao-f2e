type AvailabilityResponseType = {
  data?: { data?: { available?: boolean } };
  error?: unknown;
};
type ProfileFieldType = "name" | "customId";
type AvailabilityErrorType = "unavailable" | "failed";

/** Check both identifiers using the same trimmed values sent during registration. */
export async function checkProfileAvailability(
  values: Record<ProfileFieldType, string>,
  checks: Record<ProfileFieldType, (value: string) => Promise<AvailabilityResponseType>>
): Promise<Partial<Record<ProfileFieldType, AvailabilityErrorType>>> {
  const fields = ["name", "customId"] as const;
  const results = await Promise.allSettled(
    fields.map((field) => checks[field](values[field].trim()))
  );
  const errors: Partial<Record<ProfileFieldType, AvailabilityErrorType>> = {};
  for (const [index, field] of fields.entries()) {
    const result = results[index];
    if (!result || result.status === "rejected" || result.value.error) {
      errors[field] = "failed";
    } else if (result.value.data?.data?.available === false) {
      errors[field] = "unavailable";
    } else if (result.value.data?.data?.available !== true) {
      errors[field] = "failed";
    }
  }
  return errors;
}
