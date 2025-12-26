// ============================================
// STATISTICS SCREEN - Research Activity Analytics
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { colors } from "../../constants/colors";
import {
  getAllItems,
  getItemStats,
  StorageItem,
} from "../../services/storageService";

// ============================================
// TYPES
// ============================================

interface WeeklyData {
  name: string;
  count: number;
}

interface SourceData {
  name: string;
  value: number;
  color: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function StatisticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  const [stats, setStats] = useState({
    total: 0,
    withSummary: 0,
    bySource: [] as SourceData[],
    weekly: [] as WeeklyData[],
  });

  // Fetch and process data
  const fetchData = useCallback(async () => {
    try {
      const items = await getAllItems(1000);

      // Process source counts
      const sourceCount = { extension: 0, mobile: 0, web: 0, smart_pen: 0 };
      const weekMap: Record<string, number> = {};
      let withSummary = 0;

      items.forEach((item) => {
        const src = (item.deviceSource || "web") as keyof typeof sourceCount;
        if (sourceCount[src] !== undefined) sourceCount[src]++;
        if (item.aiSummary) withSummary++;

        const day = new Date(item.createdAt).toLocaleDateString("en-US", {
          weekday: "short",
        });
        weekMap[day] = (weekMap[day] || 0) + 1;
      });

      const pieColors = {
        extension: colors.appleBlue,
        mobile: colors.applePurple,
        web: colors.appleGreen,
        smart_pen: colors.appleOrange,
      };

      const pieData = Object.entries(sourceCount)
        .map(([name, value]) => ({
          name: name.replace("_", " "),
          value,
          color: pieColors[name as keyof typeof pieColors],
        }))
        .filter((d) => d.value > 0);

      const weeklyData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
        (day) => ({ name: day, count: weekMap[day] || 0 })
      );

      setStats({
        total: items.length,
        withSummary,
        bySource: pieData,
        weekly: weeklyData,
      });
    } catch (error) {
      console.error("Stats error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Computed stats
  const computed = useMemo(() => {
    const weekTotal = stats.weekly.reduce((a, b) => a + b.count, 0);
    const avgPerDay = Math.round(stats.total / 7) || 0;
    const maxCount = Math.max(...stats.weekly.map((d) => d.count), 1);
    const mostActiveDay = stats.weekly.reduce(
      (a, b) => (a.count > b.count ? a : b),
      { name: "–", count: 0 }
    ).name;
    const aiCoverage =
      stats.total > 0
        ? `${Math.round((stats.withSummary / stats.total) * 100)}%`
        : "0%";

    return { weekTotal, avgPerDay, maxCount, mostActiveDay, aiCoverage };
  }, [stats]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.appleBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.appleBlue}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>📊</Text>
          </View>
          <View>
            <Text style={styles.title}>Statistics</Text>
            <Text style={styles.subtitle}>Track your research activity</Text>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeSelector}>
          {(["week", "month", "all"] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeButton,
                timeRange === range && styles.timeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === range && styles.timeButtonTextActive,
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stat Cards */}
        <View style={styles.statCardsContainer}>
          <View style={styles.statCardRow}>
            <View
              style={[styles.statCard, { borderLeftColor: colors.appleBlue }]}
            >
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
            <View
              style={[styles.statCard, { borderLeftColor: colors.applePurple }]}
            >
              <Text style={styles.statNumber}>{stats.withSummary}</Text>
              <Text style={styles.statLabel}>AI Summaries</Text>
            </View>
          </View>
          <View style={styles.statCardRow}>
            <View
              style={[styles.statCard, { borderLeftColor: colors.appleGreen }]}
            >
              <Text style={styles.statNumber}>{computed.weekTotal}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View
              style={[styles.statCard, { borderLeftColor: colors.appleOrange }]}
            >
              <Text style={styles.statNumber}>{computed.avgPerDay}</Text>
              <Text style={styles.statLabel}>Avg/Day</Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>📈 Weekly Activity</Text>
            <Text style={styles.chartSubtitle}>Last 7 days</Text>
          </View>
          <View style={styles.barChart}>
            {stats.weekly.map((day) => (
              <View key={day.name} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(day.count / computed.maxCount) * 100}%`,
                        backgroundColor: colors.appleBlue,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{day.name}</Text>
                <Text style={styles.barValue}>{day.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Source Breakdown */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>📱 Source Breakdown</Text>
            <Text style={styles.chartSubtitle}>All time</Text>
          </View>
          {stats.bySource.length > 0 ? (
            <View style={styles.sourceList}>
              {stats.bySource.map((source) => (
                <View key={source.name} style={styles.sourceRow}>
                  <View
                    style={[
                      styles.sourceDot,
                      { backgroundColor: source.color },
                    ]}
                  />
                  <Text style={styles.sourceName}>{source.name}</Text>
                  <View style={styles.sourceBarContainer}>
                    <View
                      style={[
                        styles.sourceBar,
                        {
                          width: `${(source.value / stats.total) * 100}%`,
                          backgroundColor: source.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.sourceValue}>{source.value}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No data available</Text>
          )}
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>💡 Quick Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>🎯</Text>
            <View>
              <Text style={styles.insightLabel}>Most Active Day</Text>
              <Text style={styles.insightValue}>{computed.mostActiveDay}</Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>⚡</Text>
            <View>
              <Text style={styles.insightLabel}>AI Coverage</Text>
              <Text style={styles.insightValue}>{computed.aiCoverage}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.darkBg,
  },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: 20 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.appleGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerIconText: { fontSize: 22 },
  title: { fontSize: 24, fontWeight: "bold", color: colors.white },
  subtitle: { fontSize: 14, color: colors.gray1 },
  timeSelector: {
    flexDirection: "row",
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  timeButtonActive: { backgroundColor: colors.gray4 },
  timeButtonText: { fontSize: 14, color: colors.gray1 },
  timeButtonTextActive: { color: colors.white, fontWeight: "600" },
  statCardsContainer: { marginBottom: 20 },
  statCardRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.gray5,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  statNumber: { fontSize: 28, fontWeight: "bold", color: colors.white },
  statLabel: { fontSize: 13, color: colors.gray1, marginTop: 4 },
  chartCard: {
    backgroundColor: colors.gray5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: { fontSize: 16, fontWeight: "600", color: colors.white },
  chartSubtitle: {
    fontSize: 12,
    color: colors.gray2,
    backgroundColor: colors.gray4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 140,
  },
  barContainer: { alignItems: "center", flex: 1 },
  barWrapper: { flex: 1, width: 24, justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 11, color: colors.gray1, marginTop: 8 },
  barValue: { fontSize: 10, color: colors.gray2, marginTop: 2 },
  sourceList: { gap: 12 },
  sourceRow: { flexDirection: "row", alignItems: "center" },
  sourceDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  sourceName: {
    fontSize: 14,
    color: colors.white,
    width: 80,
    textTransform: "capitalize",
  },
  sourceBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray4,
    borderRadius: 4,
    marginHorizontal: 10,
  },
  sourceBar: { height: "100%", borderRadius: 4 },
  sourceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
    width: 30,
    textAlign: "right",
  },
  emptyText: { color: colors.gray1, textAlign: "center", paddingVertical: 20 },
  insightsContainer: { marginBottom: 20 },
  insightsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 12,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  insightIcon: { fontSize: 24, marginRight: 14 },
  insightLabel: { fontSize: 12, color: colors.gray1 },
  insightValue: { fontSize: 18, fontWeight: "bold", color: colors.white },
});
