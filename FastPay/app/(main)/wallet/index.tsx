import { Href, Link, router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  Plus,
  Receipt,
  Search,
} from "lucide-react-native";

import { CardSubscriptionPanel } from "@/components/ui/CardSubscriptionPanel";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { VirtualCardCarousel } from "@/components/ui/VirtualCardCarousel";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { tierToCardItem } from "@/lib/cards/tiers";
import {
  filterTrendingTokens,
  formatTokenAmount,
  TRENDING_PERIODS,
  TRENDING_TOKENS,
  TrendingPeriod,
} from "@/lib/wallet/trending-tokens";
import { useCardSubscriptionStore } from "@/store/cardSubscriptionStore";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const QUICK_ACTIONS = [
  {
    id: "add-fund",
    label: "Add Fund",
    icon: Plus,
    href: "/buy" as Href,
    highlight: true,
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: ArrowUpRight,
    href: "/convert" as Href,
  },
  {
    id: "receive",
    label: "Receive",
    icon: ArrowDown,
    href: "/wallet/send-receive?mode=receive" as Href,
  },
  {
    id: "purchase",
    label: "Purchase",
    icon: Receipt,
    scrollToSubscriptions: true,
  },
] as const;

export default function WalletScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const subscriptionsY = useRef(0);
  const [sensitiveVisible, setSensitiveVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState<TrendingPeriod>("today");
  const [periodOpen, setPeriodOpen] = useState(false);
  const { user, isReady, isLoading } = useRequireAuth();
  const { wallet, initialize, createWallet, isLoading: walletLoading, isReady: walletReady } =
    useWalletStore();
  const {
    initialize: initSubscriptions,
    isReady: subscriptionsReady,
    activeTierId,
    ownedTierIds,
  } = useCardSubscriptionStore();

  const ownedCards = useMemo(() => {
    const order = ["standard", "bronze", "silver", "gold"] as const;
    return order
      .filter((tierId) => ownedTierIds.includes(tierId))
      .map(tierToCardItem);
  }, [ownedTierIds]);

  const trendingTokens = useMemo(
    () => filterTrendingTokens(TRENDING_TOKENS[period], searchQuery),
    [period, searchQuery],
  );

  const periodLabel =
    TRENDING_PERIODS.find((item) => item.id === period)?.label ?? "Today";

  useEffect(() => {
    if (user) {
      void initialize();
      void initSubscriptions();
    }
  }, [user, initialize, initSubscriptions]);

  if (!isReady || isLoading || !user || !subscriptionsReady) {
    return (
      <TabScreenLayout scroll={false}>
        <Text style={styles.muted}>Loading...</Text>
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout scrollRef={scrollRef}>
      <Text style={styles.title}>Wallet</Text>

      <VirtualCardCarousel
        holderName={user.fullName}
        cards={ownedCards}
        activeCardId={activeTierId}
        revealed={sensitiveVisible}
        onToggleReveal={() => setSensitiveVisible((v) => !v)}
      />

      <View style={styles.actions}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.id}
              style={styles.actionBtn}
              onPress={() => {
                if ("scrollToSubscriptions" in action && action.scrollToSubscriptions) {
                  scrollRef.current?.scrollTo({
                    y: subscriptionsY.current,
                    animated: true,
                  });
                  return;
                }
                if ("href" in action) {
                  router.push(action.href);
                }
              }}
            >
              <View
                style={[
                  styles.actionIcon,
                  "highlight" in action && action.highlight && styles.actionIconHighlight,
                ]}
              >
                <Icon color={colors.white} size={22} strokeWidth={2} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.searchBar}>
        <Search color={colors.textMuted} size={18} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Tokens"
          placeholderTextColor={colors.textSubtle}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Tokens</Text>
        <Pressable
          style={styles.periodBtn}
          onPress={() => setPeriodOpen((open) => !open)}
        >
          <Text style={styles.periodLabel}>{periodLabel}</Text>
          <ChevronDown color={colors.textMuted} size={16} />
        </Pressable>
      </View>

      {periodOpen ? (
        <View style={styles.periodMenu}>
          {TRENDING_PERIODS.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.periodOption,
                period === item.id && styles.periodOptionActive,
              ]}
              onPress={() => {
                setPeriod(item.id);
                setPeriodOpen(false);
              }}
            >
              <Text
                style={[
                  styles.periodOptionText,
                  period === item.id && styles.periodOptionTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {trendingTokens.length === 0 ? (
        <Text style={styles.empty}>No tokens match your search.</Text>
      ) : (
        trendingTokens.map((token) => (
          <View key={token.id} style={styles.tokenCard}>
            <Image source={{ uri: token.image }} style={styles.tokenThumb} />
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenName}>{token.name}</Text>
              <Text style={styles.tokenDate}>{token.date}</Text>
            </View>
            <Text style={styles.tokenAmount}>
              {formatTokenAmount(token.amountRwf)}
            </Text>
          </View>
        ))
      )}

      <View
        onLayout={(event) => {
          subscriptionsY.current = event.nativeEvent.layout.y;
        }}
      >
        <CardSubscriptionPanel />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Stellar wallet</Text>
        <Text style={styles.value}>
          {walletReady
            ? wallet
              ? wallet.publicKey
              : "No wallet created yet"
            : "Loading..."}
        </Text>
      </View>

      {!wallet ? (
        <Pressable
          style={[styles.button, walletLoading && styles.disabled]}
          disabled={!walletReady || walletLoading}
          onPress={() => void createWallet()}
        >
          <Text style={styles.buttonText}>
            {walletLoading ? "Creating..." : "Create wallet"}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.linkRow}>
          <Link href="/wallet/send-receive?mode=send" style={styles.link}>
            Receive & Send
          </Link>
        </View>
      )}
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted },
  title: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    alignItems: "center",
    width: "23%",
    gap: spacing.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconHighlight: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,174,239,0.1)",
  },
  actionLabel: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.inputBg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    padding: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  periodBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  periodLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  periodMenu: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  periodOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  periodOptionActive: {
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  periodOptionText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  periodOptionTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  tokenCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  tokenThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  tokenDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  tokenAmount: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.inputBg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  value: { color: colors.white, fontSize: 13, lineHeight: 20 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: { color: colors.white, fontWeight: "600" },
  disabled: { opacity: 0.5 },
  linkRow: {
    marginBottom: spacing.md,
  },
  link: {
    color: colors.white,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    overflow: "hidden",
  },
});
