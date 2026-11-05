interface IResourceBinding {
  organizationId: number;
  templateId: number;
}

/** Keep authorized bindings that cannot be reached through this organization's template cards. */
export function getFallbackResourceBindings<T extends IResourceBinding>(
  bindings: T[],
  organizationId: number | undefined,
  templates: { id: number }[]
): T[] {
  const reachableTemplateIds = new Set(templates.map((template) => template.id));
  return bindings.filter(
    (binding) =>
      binding.organizationId !== organizationId || !reachableTemplateIds.has(binding.templateId)
  );
}
