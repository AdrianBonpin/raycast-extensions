import { List } from "@raycast/api";
import { KimiUsage, KimiError } from "./types";
import type { Accessory } from "../agents/types";
import { formatResetTime } from "../agents/format";
import { formatRemainingPercent, getRemainingPercent } from "./percentage";
import {
  renderErrorOrNoData,
  formatErrorOrNoData,
  getLoadingAccessory,
  getNoDataAccessory,
  generatePieIcon,
} from "../agents/ui";

export function formatKimiUsageText(usage: KimiUsage | null, error: KimiError | null): string {
  const fallback = formatErrorOrNoData("Kimi", usage, error);
  if (fallback !== null) return fallback;
  const u = usage as KimiUsage;

  let text = `Kimi Usage`;

  if (u.rateLimit) {
    text += `\n\nRate Limit Details (${u.rateLimit.windowMinutes}m window)`;
    text += `\nRemaining: ${formatRemainingPercent(u.rateLimit.remaining, u.rateLimit.limit)}`;
    text += `\nResets In: ${formatResetTime(u.rateLimit.resetTime)}`;
  }

  const weeklyPercent = Math.round((u.used / u.limit) * 100);
  text += `\n\nWeekly Usage`;
  text += `\nUsed: ${weeklyPercent}% (${u.used}/${u.limit})`;
  text += `\nResets In: ${formatResetTime(u.resetTime)}`;

  return text;
}

export function renderKimiDetail(usage: KimiUsage | null, error: KimiError | null): React.ReactNode {
  const fallback = renderErrorOrNoData(usage, error);
  if (fallback !== null) return fallback;
  const u = usage as KimiUsage;

  const weeklyPercent = Math.round((u.used / u.limit) * 100);

  return (
    <List.Item.Detail.Metadata>
      {u.rateLimit && (
        <>
          <List.Item.Detail.Metadata.Label title="Rate Limit Details" text="" />
          <List.Item.Detail.Metadata.Label
            title={`Limit (${u.rateLimit.windowMinutes}m window)`}
            text={formatRemainingPercent(u.rateLimit.remaining, u.rateLimit.limit)}
          />
          <List.Item.Detail.Metadata.Label title="Resets In" text={formatResetTime(u.rateLimit.resetTime)} />
          <List.Item.Detail.Metadata.Separator />
        </>
      )}

      <List.Item.Detail.Metadata.Label title="Weekly Usage" text="" />
      <List.Item.Detail.Metadata.Label title="Used" text={`${weeklyPercent}% (${u.used}/${u.limit})`} />
      <List.Item.Detail.Metadata.Label title="Resets In" text={formatResetTime(u.resetTime)} />
    </List.Item.Detail.Metadata>
  );
}

export function getKimiAccessory(usage: KimiUsage | null, error: KimiError | null, isLoading: boolean): Accessory {
  if (isLoading) return getLoadingAccessory("Kimi");

  if (error) {
    if (error.type === "not_configured") return { text: "Not Configured", tooltip: error.message };
    if (error.type === "unauthorized") return { text: "Token Expired", tooltip: error.message };
    if (error.type === "network_error") return { text: "Network Error", tooltip: error.message };
    return { text: "Error", tooltip: error.message };
  }

  if (!usage) return getNoDataAccessory();

  const { remaining, limit } = usage;
  const tooltipParts = [`Quota: ${remaining}/${limit}`];
  if (usage.rateLimit) {
    tooltipParts.push(
      `Rate (${usage.rateLimit.windowMinutes}m): ${usage.rateLimit.remaining}/${usage.rateLimit.limit}`,
    );
  }

  return {
    icon: generatePieIcon(getRemainingPercent(remaining, limit)),
    text: formatRemainingPercent(remaining, limit),
    tooltip: tooltipParts.join(" | "),
  };
}
