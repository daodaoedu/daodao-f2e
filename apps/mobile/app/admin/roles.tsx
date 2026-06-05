import { useState } from "react";
import { Alert } from "react-native";
import useSWR from "swr";
import { Button, Input, Text, XStack, YStack } from "tamagui";
import {
  AdminScreen,
  asArray,
  asRecord,
  EmptyState,
  FieldRow,
  formatDate,
  LoadingState,
  SectionCard,
  stringValue,
} from "@/components/admin/admin-components";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { api } from "@/services/api-client";

export default function AdminRolesScreen() {
  const t = useMobileTranslation("mobile.admin");
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
  const [roleName, setRoleName] = useState("");
  const [permissionName, setPermissionName] = useState("");
  const roles = useSWR("/admin/roles", () => api.get<{ data?: unknown }>("/admin/roles"));
  const permissions = useSWR("/admin/permissions", () =>
    api.get<{ data?: unknown }>("/admin/permissions")
  );
  const roleItems = asArray(roles.data?.data);
  const permissionItems = asArray(permissions.data?.data);

  const createRole = async () => {
    if (!roleName.trim()) return;
    try {
      await api.post("/admin/roles", { name: roleName.trim() });
      setRoleName("");
      await roles.mutate();
      Alert.alert("", t("role_created"));
    } catch {
      Alert.alert(t("error_title"), t("role_create_failed"));
    }
  };

  const createPermission = async () => {
    if (!permissionName.trim()) return;
    try {
      await api.post("/admin/permissions", { name: permissionName.trim() });
      setPermissionName("");
      await permissions.mutate();
      Alert.alert("", t("permission_created"));
    } catch {
      Alert.alert(t("error_title"), t("permission_create_failed"));
    }
  };

  return (
    <AdminScreen
      title={t("roles_title")}
      refreshing={roles.isValidating || permissions.isValidating}
      onRefresh={() => {
        roles.mutate();
        permissions.mutate();
      }}
    >
      <XStack gap="$2">
        {(["roles", "permissions"] as const).map((tab) => (
          <Button
            key={tab}
            flex={1}
            backgroundColor={activeTab === tab ? colors.primary.palest : "$backgroundHover"}
            onPress={() => setActiveTab(tab)}
          >
            <Text color={activeTab === tab ? colors.primary.base : "$color"}>
              {t(`tab_${tab}`)}
            </Text>
          </Button>
        ))}
      </XStack>

      {activeTab === "roles" ? (
        <SectionCard title={t("role_management")}>
          <XStack gap="$2">
            <Input
              flex={1}
              value={roleName}
              onChangeText={setRoleName}
              placeholder={t("new_role_placeholder")}
            />
            <Button backgroundColor={colors.primary.base} onPress={createRole}>
              <Text color={colors.basic.white}>{t("create")}</Text>
            </Button>
          </XStack>
          {roles.isLoading ? (
            <LoadingState label={t("loading")} />
          ) : roleItems.length === 0 ? (
            <EmptyState label={t("empty_roles")} />
          ) : (
            <YStack gap="$3">
              {roleItems.map((role, index) => (
                <RoleRow key={stringValue(role.id, `role-${index}`)} role={role} />
              ))}
            </YStack>
          )}
        </SectionCard>
      ) : (
        <SectionCard title={t("permission_management")}>
          <XStack gap="$2">
            <Input
              flex={1}
              value={permissionName}
              onChangeText={setPermissionName}
              placeholder={t("new_permission_placeholder")}
            />
            <Button backgroundColor={colors.primary.base} onPress={createPermission}>
              <Text color={colors.basic.white}>{t("create")}</Text>
            </Button>
          </XStack>
          {permissions.isLoading ? (
            <LoadingState label={t("loading")} />
          ) : permissionItems.length === 0 ? (
            <EmptyState label={t("empty_permissions")} />
          ) : (
            <YStack gap="$3">
              {permissionItems.map((permission, index) => (
                <YStack key={stringValue(permission.id, `permission-${index}`)} gap="$1">
                  <Text fontSize={15} fontWeight="700" color="$color">
                    {stringValue(permission.name)}
                  </Text>
                  <Text fontSize={12} color="$color" opacity={0.6}>
                    {stringValue(permission.description, t("no_description"))}
                  </Text>
                </YStack>
              ))}
            </YStack>
          )}
        </SectionCard>
      )}
    </AdminScreen>
  );
}

function RoleRow({ role }: { role: Record<string, unknown> }) {
  const t = useMobileTranslation("mobile.admin");
  const [expanded, setExpanded] = useState(false);
  const detail = useSWR(expanded ? `/admin/roles/${stringValue(role.id)}` : null, () =>
    api.get<{ data?: unknown }>(`/admin/roles/${stringValue(role.id)}`)
  );
  const permissions = asArray(asRecord(detail.data?.data).permissions);

  return (
    <YStack gap="$2">
      <Button
        height="auto"
        padding="$3"
        backgroundColor="$backgroundHover"
        onPress={() => setExpanded((v) => !v)}
      >
        <YStack flex={1} alignItems="stretch" gap="$1">
          <Text fontSize={15} fontWeight="700" color="$color">
            {stringValue(role.name)}
          </Text>
          <Text fontSize={12} color="$color" opacity={0.6}>
            {stringValue(role.description, t("no_description"))}
          </Text>
        </YStack>
      </Button>
      {expanded ? (
        <YStack paddingHorizontal="$2" gap="$2">
          <FieldRow label={t("created_at")} value={formatDate(role.createdAt)} />
          <FieldRow label={t("permission_count")} value={stringValue(role.permissionCount, "0")} />
          {detail.isLoading ? (
            <LoadingState label={t("loading")} />
          ) : permissions.length === 0 ? (
            <EmptyState label={t("empty_role_permissions")} />
          ) : (
            <XStack flexWrap="wrap" gap="$2">
              {permissions.map((permission, index) => (
                <Text
                  key={stringValue(permission.id, `role-permission-${index}`)}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$full"
                  backgroundColor={colors.primary.palest}
                  color={colors.primary.base}
                  fontSize={12}
                >
                  {stringValue(permission.name)}
                </Text>
              ))}
            </XStack>
          )}
        </YStack>
      ) : null}
    </YStack>
  );
}
