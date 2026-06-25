import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { VirtualCard } from "@/components/ui/VirtualCard";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export interface VirtualCardItem {
  id: string;
  tierId?: string;
  tierLabel?: string;
  cardNumber: string;
  expiry: string;
  gradientColors: [string, string];
}

interface VirtualCardCarouselProps {
  holderName: string;
  cards: VirtualCardItem[];
  revealed?: boolean;
  onToggleReveal?: () => void;
  activeCardId?: string;
}

export function VirtualCardCarousel({
  holderName,
  cards,
  revealed,
  onToggleReveal,
  activeCardId,
}: VirtualCardCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const listRef = useRef<FlatList<VirtualCardItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = screenWidth - spacing.lg * 2;
  const snapInterval = cardWidth + spacing.md;

  useEffect(() => {
    if (!activeCardId || cards.length === 0) {
      return;
    }

    const index = cards.findIndex((card) => card.id === activeCardId);
    if (index < 0) {
      return;
    }

    setActiveIndex(index);
    listRef.current?.scrollToOffset({
      offset: index * snapInterval,
      animated: true,
    });
  }, [activeCardId, cards, snapInterval]);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    setActiveIndex(Math.min(Math.max(index, 0), cards.length - 1));
  };

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={cards}
        horizontal
        pagingEnabled={false}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.cardSlot, { width: cardWidth }]}>
            <VirtualCard
              holderName={holderName}
              cardNumber={item.cardNumber}
              expiry={item.expiry}
              gradientColors={item.gradientColors}
              tierLabel={item.tierLabel}
              revealed={revealed}
              onToggleReveal={onToggleReveal}
              hideDots
            />
          </View>
        )}
      />

      <View style={styles.dots}>
        {cards.map((card, index) => (
          <View
            key={card.id}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  listContent: {
    paddingRight: spacing.lg,
  },
  cardSlot: {
    marginRight: spacing.md,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 8,
    height: 8,
  },
});
