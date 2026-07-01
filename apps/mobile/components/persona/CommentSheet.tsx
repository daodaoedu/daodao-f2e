import { type ReactNode, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView, Sheet, Text } from "tamagui";

interface CommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export function CommentSheet({ open, onOpenChange, title, children }: CommentSheetProps) {
  // Tamagui Sheet crashes with "setValue of undefined" when mounted with open=false
  // on its very first mount, so delay mounting until it has opened at least once.
  // After that, keep it mounted so closing plays the exit animation instead of
  // unmounting abruptly.
  const [hasOpened, setHasOpened] = useState(false);

  if (open && !hasOpened) {
    setHasOpened(true);
  }

  if (!hasOpened) {
    return null;
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      dismissOnSnapToBottom
      zIndex={100001}
    >
      <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame
        padding="$4"
        backgroundColor="$background"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
      >
        <Sheet.Handle backgroundColor="$borderColor" />

        <Text fontSize={18} fontWeight="600" marginBottom="$3">
          {title}
        </Text>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView flex={1} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </Sheet.Frame>
    </Sheet>
  );
}
