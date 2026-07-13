import { Children, type ReactNode, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

/** product: grid grid-cols-2 gap-3 (=12px) */
const GAP = 12;

interface ResourceGridProps {
  children: ReactNode;
}

/**
 * 對齊 product 資源 2 欄 grid：
 * - 固定半寬，單一資源不會 flexGrow 撐滿整列
 * - gap-3
 */
export function ResourceGrid({ children }: ResourceGridProps) {
  const [containerW, setContainerW] = useState(0);
  const items = Children.toArray(children);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - containerW) > 0.5) {
      setContainerW(w);
    }
  };

  const cardW = containerW > 0 ? (containerW - GAP) / 2 : undefined;

  return (
    <View
      onLayout={onLayout}
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: GAP,
      }}
    >
      {items.map((child, index) => (
        <View
          // Children.toArray 保留 child key；index 僅 fallback
          key={(child as { key?: string | null }).key ?? `resource-cell-${index}`}
          style={cardW != null ? { width: cardW } : { width: "47%" }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}