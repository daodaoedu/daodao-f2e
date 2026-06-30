import { useCities, useCountries, useUserMutations } from "@daodao/api";
import { Camera, Check, ChevronDown, ChevronLeft } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Avatar,
  Button,
  Card,
  Input,
  ScrollView,
  Switch,
  Text,
  TextArea,
  XStack,
  YStack,
} from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMobileTranslation } from "@/i18n";

type LocationOptionType = {
  value: string;
  label: string;
};

type PublicInfoFieldErrorKey =
  | "name"
  | "customId"
  | "location"
  | "personalSlogan"
  | "selfIntroduction";

type PublicInfoFieldErrors = Partial<Record<PublicInfoFieldErrorKey, string>>;

type ErrorWithDetails = Error & {
  details?: Array<{ path?: string; message?: string }>;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  if (typeof error === "object" && error !== null && "error" in error) {
    const nested = (error as { error?: { message?: unknown } }).error;
    if (typeof nested?.message === "string" && nested.message) return nested.message;
  }
  return fallback;
}

function getErrorDetails(error: unknown): Array<{ path?: string; message?: string }> {
  if (error instanceof Error && Array.isArray((error as ErrorWithDetails).details)) {
    return (error as ErrorWithDetails).details ?? [];
  }
  if (typeof error === "object" && error !== null) {
    const directDetails = (error as { details?: unknown }).details;
    if (Array.isArray(directDetails))
      return directDetails as Array<{ path?: string; message?: string }>;

    const nestedDetails = (error as { error?: { details?: unknown } }).error?.details;
    if (Array.isArray(nestedDetails))
      return nestedDetails as Array<{ path?: string; message?: string }>;
  }
  return [];
}

function mapFieldErrors(error: unknown): PublicInfoFieldErrors {
  const fieldMap: Record<string, PublicInfoFieldErrorKey> = {
    name: "name",
    customId: "customId",
    location: "location",
    personalSlogan: "personalSlogan",
    selfIntroduction: "selfIntroduction",
  };

  return getErrorDetails(error).reduce<PublicInfoFieldErrors>((acc, detail) => {
    if (!detail.path || !detail.message) return acc;
    const field = fieldMap[detail.path];
    if (field) acc[field] = detail.message;
    return acc;
  }, {});
}

function LocationSelectionModal({
  visible,
  title,
  options,
  selected,
  emptyText,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: LocationOptionType[];
  selected: string;
  emptyText: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  const t = useMobileTranslation("mobile.publicInfoSettings");

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          <XStack padding="$4" alignItems="center" justifyContent="space-between">
            <Button size="$3" chromeless onPress={onClose}>
              <Text fontSize={14} color="$color">
                {t("cancel")}
              </Text>
            </Button>
            <Text fontSize={16} fontWeight="600" color="$color">
              {title}
            </Text>
            <YStack width={48} />
          </XStack>
          <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
            <YStack gap="$2">
              {options.length === 0 ? (
                <Text fontSize={14} color="$color" opacity={0.5} textAlign="center" padding="$4">
                  {emptyText}
                </Text>
              ) : (
                options.map((option) => {
                  const isSelected = selected === option.value;
                  return (
                    <Button
                      key={option.value}
                      size="$4"
                      justifyContent="space-between"
                      backgroundColor={isSelected ? colors.primary.palest : "$background"}
                      borderWidth={1}
                      borderColor={isSelected ? colors.primary.base : "$borderColor"}
                      pressStyle={{ opacity: 0.75 }}
                      onPress={() => {
                        onSelect(option.value);
                        onClose();
                      }}
                    >
                      <Text fontSize={14} color={isSelected ? colors.primary.base : "$color"}>
                        {option.label}
                      </Text>
                      {isSelected && <Check size={16} color={colors.primary.base} />}
                    </Button>
                  );
                })
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </SafeAreaView>
    </Modal>
  );
}

export default function PublicInfoSettingsScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.publicInfoSettings");
  const tCommon = useMobileTranslation("common");
  const { user, isLoading, mutate } = useCurrentUser();
  const { updateCurrentUser, updateCurrentUserWithFormData } = useUserMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PublicInfoFieldErrors>({});
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const [name, setName] = useState("");
  const [customId, setCustomId] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [personalSlogan, setPersonalSlogan] = useState("");
  const [selfIntroduction, setSelfIntroduction] = useState("");
  const [hideConnectionsCount, setHideConnectionsCount] = useState(false);

  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [discord, setDiscord] = useState("");
  const [line, setLine] = useState("");
  const [threads, setThreads] = useState("");
  const [personalUrl, setPersonalUrl] = useState("");

  const userLocation =
    ((user as unknown as Record<string, unknown> | null)?.location as string) || "";
  const { data: countriesData, isLoading: isCountriesLoading } = useCountries();
  const { data: selectedLocationCitiesData, isLoading: isSelectedLocationLoading } = useCities({
    search: userLocation || undefined,
    locale: "zh-TW",
    limit: userLocation ? 1 : undefined,
  });
  const { data: citiesData, isLoading: isCitiesLoading } = useCities({
    country: country || undefined,
    locale: "zh-TW",
  });

  const countries = useMemo(() => {
    const data = countriesData?.data ?? [];
    return data
      .filter((item) => item.code)
      .map((item) => ({
        value: item.code,
        label: item.name || item.nameEn || item.code,
      }));
  }, [countriesData]);

  const cities = useMemo(() => {
    const data = citiesData?.data ?? [];
    return data
      .filter((item) => item.code)
      .map((item) => ({
        value: item.code,
        label: item.name || item.nameEn || item.code,
      }));
  }, [citiesData]);

  const initialCountry = useMemo(() => {
    return (
      selectedLocationCitiesData?.data?.find((item) => item.code === userLocation)?.countryCode ??
      ""
    );
  }, [selectedLocationCitiesData, userLocation]);

  const countryLabel = countries.find((item) => item.value === country)?.label ?? "";
  const cityLabel = cities.find((item) => item.value === location)?.label ?? "";

  const initialSnapshot = useMemo(() => {
    if (!user) return null;
    const u = user as unknown as Record<string, unknown>;
    const contactList = (u.contactList ?? {}) as Record<string, string>;
    return {
      name: (u.name as string) || "",
      customId: (u.customId as string) || "",
      country: initialCountry,
      location: (u.location as string) || "",
      personalSlogan: (u.personalSlogan as string) || "",
      selfIntroduction: (u.selfIntroduction as string) || "",
      hideConnectionsCount: (u.hideConnectionsCount as boolean) ?? false,
      facebook: contactList.facebook || "",
      instagram: contactList.instagram || "",
      linkedin: contactList.linkedin || "",
      github: contactList.github || "",
      discord: contactList.discord || "",
      line: contactList.line || "",
      threads: contactList.threads || "",
      personalUrl: contactList.website || "",
    };
  }, [initialCountry, user]);

  const currentSnapshot = useMemo(
    () => ({
      name,
      customId,
      country,
      location,
      personalSlogan,
      selfIntroduction,
      hideConnectionsCount,
      facebook,
      instagram,
      linkedin,
      github,
      discord,
      line,
      threads,
      personalUrl,
    }),
    [
      country,
      customId,
      discord,
      facebook,
      github,
      hideConnectionsCount,
      instagram,
      line,
      linkedin,
      location,
      name,
      personalSlogan,
      personalUrl,
      selfIntroduction,
      threads,
    ]
  );

  const isDirty =
    Boolean(selectedPhotoUri) ||
    (initialSnapshot ? JSON.stringify(initialSnapshot) !== JSON.stringify(currentSnapshot) : false);

  useEffect(() => {
    if (user && (!userLocation || !isSelectedLocationLoading)) {
      const u = user as unknown as Record<string, unknown>;
      const contactList = (u.contactList ?? {}) as Record<string, string>;
      setName((u.name as string) || "");
      setCustomId((u.customId as string) || "");
      setCountry(initialCountry);
      setLocation((u.location as string) || "");
      setPersonalSlogan((u.personalSlogan as string) || "");
      setSelfIntroduction((u.selfIntroduction as string) || "");
      setHideConnectionsCount((u.hideConnectionsCount as boolean) ?? false);
      setFacebook(contactList.facebook || "");
      setInstagram(contactList.instagram || "");
      setLinkedin(contactList.linkedin || "");
      setGithub(contactList.github || "");
      setDiscord(contactList.discord || "");
      setLine(contactList.line || "");
      setThreads(contactList.threads || "");
      setPersonalUrl(contactList.website || "");
      setSelectedPhotoUri(null);
      setSelectedPhotoFile(null);
      setFieldErrors({});
    }
  }, [initialCountry, isSelectedLocationLoading, user, userLocation]);

  const clearFieldError = (field: PublicInfoFieldErrorKey) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleBack = () => {
    if (!isDirty) {
      router.back();
      return;
    }

    Alert.alert(t("unsavedTitle"), t("unsavedMessage"), [
      { text: t("keepEditing"), style: "cancel" },
      { text: t("leave"), style: "destructive", onPress: () => router.back() },
    ]);
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("photoPermissionTitle"), t("photoPermissionMessage"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `avatar-${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? "image/jpeg";
    const file = {
      uri: asset.uri,
      name: fileName,
      type: mimeType,
    } as unknown as File;

    setSelectedPhotoUri(asset.uri);
    setSelectedPhotoFile(file);
  };

  const handleSave = async () => {
    setFieldErrors({});
    if (!name.trim()) {
      setFieldErrors({ name: t("nameRequired") });
      Alert.alert(t("errorTitle"), t("nameRequired"));
      return;
    }
    setIsSubmitting(true);
    try {
      const currentCustomId =
        ((user as unknown as Record<string, unknown>)?.customId as string) || "";
      const jsonUpdate = {
        name,
        ...(customId !== currentCustomId ? { customId } : {}),
        ...(location ? { location } : {}),
        personalSlogan,
        selfIntroduction,
        hideConnectionsCount,
        contactList: {
          facebook,
          instagram,
          linkedin,
          github,
          discord,
          line,
          threads,
          website: personalUrl,
        },
      };

      if (selectedPhotoFile) {
        await updateCurrentUserWithFormData(
          {
            name,
            ...(customId !== currentCustomId ? { customId } : {}),
            ...(location ? { location } : {}),
            personalSlogan,
            selfIntroduction,
            contactList: jsonUpdate.contactList,
          },
          selectedPhotoFile
        );
      }

      const response = await updateCurrentUser(jsonUpdate);
      if (response.error) {
        throw response.error;
      }
      await mutate();
      setSelectedPhotoUri(null);
      setSelectedPhotoFile(null);
      Alert.alert(t("successTitle"), t("saveSuccess"), [
        { text: t("confirm"), onPress: () => router.back() },
      ]);
    } catch (error) {
      const nextFieldErrors = mapFieldErrors(error);
      setFieldErrors(nextFieldErrors);
      const firstFieldError = Object.values(nextFieldErrors)[0];
      Alert.alert(t("errorTitle"), firstFieldError ?? getErrorMessage(error, t("saveError")));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
          <Text fontSize={14} color="$color" opacity={0.5}>
            {t("loading")}
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={handleBack}
            accessibilityLabel={tCommon("back")}
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color" flex={1}>
            {t("title")}
          </Text>
          <Button
            size="$3"
            backgroundColor={colors.primary.base}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSave}
            disabled={isSubmitting || !isDirty}
            opacity={isDirty ? 1 : 0.55}
          >
            <Text color={colors.basic.white} fontWeight="600" fontSize={14}>
              {isSubmitting ? t("saving") : t("save")}
            </Text>
          </Button>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <YStack gap="$5">
            {/* 頭像 */}
            <YStack alignItems="center" gap="$3">
              <YStack position="relative">
                <Avatar circular size="$8">
                  {selectedPhotoUri || user?.photoURL ? (
                    <Avatar.Image source={{ uri: selectedPhotoUri ?? user?.photoURL ?? "" }} />
                  ) : (
                    <Avatar.Fallback backgroundColor={colors.primary.lighter}>
                      <Text fontSize={32} fontWeight="600" color={colors.primary.darker}>
                        {name?.charAt(0) || "?"}
                      </Text>
                    </Avatar.Fallback>
                  )}
                </Avatar>
                <Button
                  position="absolute"
                  bottom={0}
                  right={0}
                  size="$3"
                  circular
                  backgroundColor={colors.primary.base}
                  onPress={handlePickPhoto}
                  accessibilityLabel={t("chooseAvatar")}
                >
                  <Camera size={16} color={colors.basic.white} />
                </Button>
              </YStack>
            </YStack>

            {/* 基本資料 */}
            <Card
              padding="$4"
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <YStack gap="$4">
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                    {t("name")}
                  </Text>
                  <Input
                    size="$4"
                    value={name}
                    onChangeText={(value) => {
                      setName(value);
                      clearFieldError("name");
                    }}
                    placeholder={t("namePlaceholder")}
                    borderColor={fieldErrors.name ? colors.semantic.error : undefined}
                  />
                  {fieldErrors.name ? (
                    <Text fontSize={12} color={colors.semantic.error}>
                      {fieldErrors.name}
                    </Text>
                  ) : null}
                </YStack>
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                    {t("customId")}
                  </Text>
                  <Input
                    size="$4"
                    value={customId}
                    onChangeText={(value) => {
                      setCustomId(value);
                      clearFieldError("customId");
                    }}
                    placeholder={t("customIdPlaceholder")}
                    autoCapitalize="none"
                    borderColor={fieldErrors.customId ? colors.semantic.error : undefined}
                  />
                  {fieldErrors.customId ? (
                    <Text fontSize={12} color={colors.semantic.error}>
                      {fieldErrors.customId}
                    </Text>
                  ) : null}
                </YStack>
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                    {t("location")}
                  </Text>
                  <Button
                    size="$4"
                    justifyContent="space-between"
                    backgroundColor="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    onPress={() => setShowCountryPicker(true)}
                    disabled={isCountriesLoading}
                  >
                    <Text
                      fontSize={14}
                      color={countryLabel ? "$color" : "$color"}
                      opacity={countryLabel ? 1 : 0.5}
                    >
                      {isCountriesLoading
                        ? t("loadingCountries")
                        : countryLabel || t("selectCountry")}
                    </Text>
                    <ChevronDown size={16} color="$color" opacity={0.5} />
                  </Button>
                  <Button
                    size="$4"
                    justifyContent="space-between"
                    backgroundColor="$background"
                    borderWidth={1}
                    borderColor={fieldErrors.location ? colors.semantic.error : "$borderColor"}
                    onPress={() => setShowCityPicker(true)}
                    disabled={!country || isCitiesLoading}
                    opacity={!country ? 0.6 : 1}
                  >
                    <Text
                      fontSize={14}
                      color={cityLabel ? "$color" : "$color"}
                      opacity={cityLabel ? 1 : 0.5}
                    >
                      {!country
                        ? t("selectCountryFirst")
                        : isCitiesLoading
                          ? t("loadingCities")
                          : cityLabel || t("selectCity")}
                    </Text>
                    <ChevronDown size={16} color="$color" opacity={0.5} />
                  </Button>
                  {fieldErrors.location ? (
                    <Text fontSize={12} color={colors.semantic.error}>
                      {fieldErrors.location}
                    </Text>
                  ) : null}
                </YStack>
              </YStack>
            </Card>

            {/* 自我介紹 */}
            <Card
              padding="$4"
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <YStack gap="$4">
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                    {t("personalSlogan")}
                  </Text>
                  <Input
                    size="$4"
                    value={personalSlogan}
                    onChangeText={(value) => {
                      setPersonalSlogan(value);
                      clearFieldError("personalSlogan");
                    }}
                    placeholder={t("personalSloganPlaceholder")}
                    borderColor={fieldErrors.personalSlogan ? colors.semantic.error : undefined}
                  />
                  {fieldErrors.personalSlogan ? (
                    <Text fontSize={12} color={colors.semantic.error}>
                      {fieldErrors.personalSlogan}
                    </Text>
                  ) : null}
                </YStack>
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                    {t("selfIntroduction")}
                  </Text>
                  <TextArea
                    size="$4"
                    value={selfIntroduction}
                    onChangeText={(value) => {
                      setSelfIntroduction(value);
                      clearFieldError("selfIntroduction");
                    }}
                    placeholder={t("selfIntroductionPlaceholder")}
                    numberOfLines={4}
                    borderColor={fieldErrors.selfIntroduction ? colors.semantic.error : undefined}
                  />
                  {fieldErrors.selfIntroduction ? (
                    <Text fontSize={12} color={colors.semantic.error}>
                      {fieldErrors.selfIntroduction}
                    </Text>
                  ) : null}
                </YStack>
              </YStack>
            </Card>

            {/* 社群連結 */}
            <Card
              padding="$4"
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <YStack gap="$4">
                <Text fontSize={15} fontWeight="600" color="$color">
                  {t("socialLinks")}
                </Text>
                {[
                  { label: t("personalWebsite"), value: personalUrl, setter: setPersonalUrl },
                  { label: "Facebook", value: facebook, setter: setFacebook },
                  { label: "Instagram", value: instagram, setter: setInstagram },
                  { label: "LinkedIn", value: linkedin, setter: setLinkedin },
                  { label: "Github", value: github, setter: setGithub },
                  { label: "Discord", value: discord, setter: setDiscord },
                  { label: "Line", value: line, setter: setLine },
                  { label: "Threads", value: threads, setter: setThreads },
                ].map(({ label, value, setter }) => (
                  <YStack key={label} gap="$1">
                    <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                      {label}
                    </Text>
                    <Input
                      size="$4"
                      value={value}
                      onChangeText={setter}
                      placeholder={label}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </YStack>
                ))}
              </YStack>
            </Card>

            {/* 隱私設定 */}
            <Card
              padding="$4"
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack alignItems="center" justifyContent="space-between">
                <YStack flex={1} gap="$1">
                  <Text fontSize={15} color="$color">
                    {t("hideConnectionsTitle")}
                  </Text>
                  <Text fontSize={12} color="$color" opacity={0.5}>
                    {t("hideConnectionsDescription")}
                  </Text>
                </YStack>
                <Switch
                  checked={hideConnectionsCount}
                  onCheckedChange={setHideConnectionsCount}
                  backgroundColor={hideConnectionsCount ? colors.primary.base : colors.basic[300]}
                >
                  <Switch.Thumb />
                </Switch>
              </XStack>
            </Card>
          </YStack>
        </ScrollView>
        <LocationSelectionModal
          visible={showCountryPicker}
          title={t("selectCountryTitle")}
          options={countries}
          selected={country}
          emptyText={t("emptyCountries")}
          onClose={() => setShowCountryPicker(false)}
          onSelect={(value) => {
            setCountry(value);
            setLocation("");
          }}
        />
        <LocationSelectionModal
          visible={showCityPicker}
          title={t("selectCityTitle")}
          options={cities}
          selected={location}
          emptyText={country ? t("emptyCities") : t("selectCountryFirst")}
          onClose={() => setShowCityPicker(false)}
          onSelect={(value) => {
            setLocation(value);
            clearFieldError("location");
          }}
        />
      </YStack>
    </SafeAreaView>
  );
}
