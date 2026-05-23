import { Redirect, useLocalSearchParams } from "expo-router";

export default function PracticeTemplateRoute() {
  const { templateId } = useLocalSearchParams<{ templateId?: string | string[] }>();
  const id = Array.isArray(templateId) ? (templateId[0] ?? "") : (templateId ?? "");

  return <Redirect href={`/practices/create/${id}`} />;
}
