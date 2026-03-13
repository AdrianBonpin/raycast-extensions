import { List } from "@raycast/api";
import { SyntheticUsage, SyntheticQuotaBucket, SyntheticError } from "./types";
import type { Accessory } from "../agents/types";
import { formatResetTime } from "../agents/format";
import {
  renderErrorOrNoData,
  formatErrorOrNoData,
  getLoadingAccessory,
  getNoDataAccessory,
  generatePieIcon,
} from "../agents/ui";

function getRemainingPercent(used: number, limit: number): number {
  if (limit === 0) return 100;
  const remaining = limit - used;
  return Math.max(0, Math.round((remaining / limit) * 100));
}

function formatQuotaText(used: number, limit: number): string {
  const remaining = limit - used;
  const pct = getRemainingPercent(used, limit);
  return `${remaining}/${limit} (${pct}%)`;
}

function formatQuotaSection(bucket: SyntheticQuotaBucket, name: string): string {
  const pct = getRemainingPercent(bucket.requests, bucket.limit);
  return `${name}: ${bucket.requests}/${bucket.limit} (${pct}%) - Renews: ${formatResetTime(bucket.renewsAt)}`;
}

export function formatSyntheticUsageText(usage: SyntheticUsage | null, error: SyntheticError | null): string {
  const fallback = formatErrorOrNoData("Synthetic", usage, error);
  if (fallback !== null) return fallback;
  const u = usage as SyntheticUsage;

  let text = `Synthetic Usage`;
  text += `\n\nSubscription`;
  text += `\n${formatQuotaSection(u.subscription, "Used")}`;
  text += `\n\nFree Tool Calls`;
  text += `\n${formatQuotaSection(u.freeToolCalls, "Used")}`;
  text += `\n\nSearch (Hourly)`;
  text += `\n${formatQuotaSection(u.search.hourly, "Used")}`;
  return text;
}

export function renderSyntheticDetail(usage: SyntheticUsage | null, error: SyntheticError | null): React.ReactNode {
  const fallback = renderErrorOrNoData(usage, error);
  if (fallback !== null) return fallback;
  const u = usage as SyntheticUsage;

  return (
    <List.Item.Detail.Metadata>
      {/* Subscription Section */}
      <List.Item.Detail.Metadata.Label title="Subscription" text="" />
      <List.Item.Detail.Metadata.Label title="Used" text={`${u.subscription.requests} / ${u.subscription.limit}`} />
      <List.Item.Detail.Metadata.Label
        title="Remaining"
        text={formatQuotaText(u.subscription.requests, u.subscription.limit)}
      />
      <List.Item.Detail.Metadata.Label title="Renews In" text={formatResetTime(u.subscription.renewsAt)} />

      <List.Item.Detail.Metadata.Separator />

      {/* Free Tool Calls Section */}
      <List.Item.Detail.Metadata.Label title="Free Tool Calls" text="" />
      <List.Item.Detail.Metadata.Label title="Used" text={`${u.freeToolCalls.requests} / ${u.freeToolCalls.limit}`} />
      <List.Item.Detail.Metadata.Label
        title="Remaining"
        text={formatQuotaText(u.freeToolCalls.requests, u.freeToolCalls.limit)}
      />
      <List.Item.Detail.Metadata.Label title="Renews In" text={formatResetTime(u.freeToolCalls.renewsAt)} />

      <List.Item.Detail.Metadata.Separator />

      {/* Search Section */}
      <List.Item.Detail.Metadata.Label title="Search (Hourly)" text="" />
      <List.Item.Detail.Metadata.Label title="Used" text={`${u.search.hourly.requests} / ${u.search.hourly.limit}`} />
      <List.Item.Detail.Metadata.Label
        title="Remaining"
        text={formatQuotaText(u.search.hourly.requests, u.search.hourly.limit)}
      />
      <List.Item.Detail.Metadata.Label title="Renews In" text={formatResetTime(u.search.hourly.renewsAt)} />
    </List.Item.Detail.Metadata>
  );
}

export function getSyntheticAccessory(
  usage: SyntheticUsage | null,
  error: SyntheticError | null,
  isLoading: boolean,
): Accessory {
  if (isLoading) return getLoadingAccessory("Synthetic");

  if (error) {
    if (error.type === "not_configured") return { text: "Not Configured", tooltip: error.message };
    if (error.type === "unauthorized") return { text: "Token Expired", tooltip: error.message };
    if (error.type === "network_error") return { text: "Network Error", tooltip: error.message };
    return { text: "Error", tooltip: error.message };
  }

  if (!usage) return getNoDataAccessory();

  const pct = getRemainingPercent(usage.subscription.requests, usage.subscription.limit);

  return {
    icon: generatePieIcon(pct),
    text: `${pct}%`,
    tooltip: `Subscription: ${usage.subscription.requests}/${usage.subscription.limit} used | Search: ${usage.search.hourly.requests}/${usage.search.hourly.limit} | Free Tools: ${usage.freeToolCalls.requests}/${usage.freeToolCalls.limit}`,
  };
}
