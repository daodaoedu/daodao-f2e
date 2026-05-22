interface OptionProps {
  value: string;
  label: string;
}

interface OptionWithDescriptionProps extends OptionProps {
  description: string;
}

const createOptionMap = (options: OptionProps[]): Map<string, string> => {
  const map = new Map<string, string>();
  options.forEach((option) => {
    map.set(option.value, option.label);
  });
  return map;
};

export const resourceTypeOptions: OptionWithDescriptionProps[] = [
  {
    value: "learning_platform_app",
    label: "learning_platform_app",
    description: "learning_platform_app",
  },
  {
    value: "learning_tools",
    label: "learning_tools",
    description: "learning_tools",
  },
  {
    value: "books_articles",
    label: "books_articles",
    description: "books_articles",
  },
  {
    value: "video_content",
    label: "video_content",
    description: "video_content",
  },
  {
    value: "podcast_content",
    label: "podcast_content",
    description: "podcast_content",
  },
  {
    value: "workshops_courses",
    label: "workshops_courses",
    description: "workshops_courses",
  },
  {
    value: "professional_certificates",
    label: "professional_certificates",
    description: "professional_certificates",
  },
  {
    value: "community_organization",
    label: "community_organization",
    description: "community_organization",
  },
];

export const costTypeOptions: OptionProps[] = [
  { value: "free", label: "free" },
  { value: "partial_free", label: "partial_free" },
  { value: "paid", label: "paid" },
];

export const targetAudienceTypeOptions: OptionWithDescriptionProps[] = [
  {
    value: "beginner",
    label: "beginner",
    description: "beginner",
  },
  {
    value: "intermediate",
    label: "intermediate",
    description: "intermediate",
  },
  {
    value: "expert",
    label: "expert",
    description: "expert",
  },
];

export const contentFeaturesOptions: OptionProps[] = [
  { value: "wellStructured", label: "wellStructured" },
  { value: "practiceFocused", label: "practiceFocused" },
  { value: "wellRoundedConcepts", label: "wellRoundedConcepts" },
  { value: "thoughtProvoking", label: "thoughtProvoking" },
  { value: "progressiveLearning", label: "progressiveLearning" },
  { value: "problemBased", label: "problemBased" },
  { value: "realWorldExamples", label: "realWorldExamples" },
  { value: "interactive", label: "interactive" },
  { value: "visuallyRich", label: "visuallyRich" },
];

export const timeUsageOptions: OptionProps[] = [
  { value: "daily", label: "daily" },
  { value: "weekly", label: "weekly" },
  { value: "fragmented", label: "fragmented" },
  { value: "notApplicable", label: "notApplicable" },
];

export const resourceUsageOptions: OptionProps[] = [
  { value: "withOnlineCourses", label: "withOnlineCourses" },
  { value: "withBooks", label: "withBooks" },
  { value: "withOtherTools", label: "withOtherTools" },
  { value: "withCommunity", label: "withCommunity" },
  { value: "onlyThisResource", label: "onlyThisResource" },
  { value: "notApplicableResource", label: "notApplicableResource" },
];

export const resourceTypeMap = createOptionMap(resourceTypeOptions);
export const costTypeMap = createOptionMap(costTypeOptions);
export const targetAudienceTypeMap = createOptionMap(targetAudienceTypeOptions);
export const contentFeaturesMap = createOptionMap(contentFeaturesOptions);
export const timeUsageMap = createOptionMap(timeUsageOptions);
export const resourceUsageMap = createOptionMap(resourceUsageOptions);

export const getResourceOptionLabelKey = (value: string) =>
  `resource_option_${value.replace(/[^a-zA-Z0-9]/g, "_")}`;

export const getResourceOptionDescriptionKey = (value: string) =>
  `resource_option_desc_${value.replace(/[^a-zA-Z0-9]/g, "_")}`;
