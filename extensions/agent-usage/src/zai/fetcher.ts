import { useState, useEffect, useCallback, useRef } from "react";
import { getPreferenceValues } from "@raycast/api";
import type { UsageState } from "../agents/types";
import { ZaiUsage, ZaiError, ZaiLimitEntry, ZaiUsageDetail } from "./types";
import { httpFetch } from "../agents/http";
import { readOpencodeAuthToken } from "../agents/opencode-auth";

const ZAI_USAGE_API = "https://api.z.ai/api/monitor/usage/quota/limit";

async function fetchZaiUsage(token: string): Promise<{ usage: ZaiUsage | null; error: ZaiError | null }> {
  const { data, error } = await httpFetch({ url: ZAI_USAGE_API, token, headers: { Accept: "application/json" } });
  if (error) return { usage: null, error };
  return parseZaiApiResponse(data);
}

interface ZaiApiLimitEntry {
  type: string;
  unit: number;
  number: number;
  usage: number | null;
  currentValue: number | null;
  remaining: number | null;
  percentage: number;
  usageDetails?: Array<{ modelCode: string; usage: number }> | null;
  nextResetTime: number | null;
}

interface ZaiApiResponse {
  code: number;
  msg: string;
  success: boolean;
  data?: {
    limits?: ZaiApiLimitEntry[];
    planName?: string;
    plan?: string;
    plan_type?: string;
    packageName?: string;
  };
}

function unitToLabel(unit: number): string {
  switch (unit) {
    case 1:
      return "days";
    case 3:
      return "hours";
    case 5:
      return "minutes";
    default:
      return "units";
  }
}

function buildWindowDescription(unit: number, num: number): string {
  return `${num} ${unitToLabel(unit)}`;
}

function parseLimitEntry(entry: ZaiApiLimitEntry): ZaiLimitEntry {
  const usageDetails: ZaiUsageDetail[] = (entry.usageDetails ?? []).map((d) => ({
    modelCode: d.modelCode,
    usage: d.usage,
  }));

  const resetTime = entry.nextResetTime != null ? new Date(entry.nextResetTime).toISOString() : null;

  return {
    type: entry.type as "TOKENS_LIMIT" | "TIME_LIMIT",
    windowDescription: buildWindowDescription(entry.unit, entry.number),
    usage: entry.usage ?? null,
    currentValue: entry.currentValue ?? null,
    remaining: entry.remaining ?? null,
    percentage: entry.percentage,
    usageDetails,
    resetTime,
  };
}

function parseZaiApiResponse(data: unknown): { usage: ZaiUsage | null; error: ZaiError | null } {
  try {
    if (!data || typeof data !== "object") {
      return { usage: null, error: { type: "parse_error", message: "Invalid API response format" } };
    }

    const response = data as ZaiApiResponse;

    if (response.success !== true || response.code !== 200) {
      return { usage: null, error: { type: "api_error", message: response.msg || "API returned an error" } };
    }

    const limits = response.data?.limits;

    if (!limits || !Array.isArray(limits)) {
      return { usage: null, error: { type: "parse_error", message: "No limits data found in API response" } };
    }

    const tokenEntry = limits.find((l) => l.type === "TOKENS_LIMIT");
    const timeEntry = limits.find((l) => l.type === "TIME_LIMIT");

    const planName =
      response.data?.planName ?? response.data?.plan ?? response.data?.plan_type ?? response.data?.packageName ?? null;

    const usage: ZaiUsage = {
      tokenLimit: tokenEntry ? parseLimitEntry(tokenEntry) : null,
      timeLimit: timeEntry ? parseLimitEntry(timeEntry) : null,
      planName,
    };

    return { usage, error: null };
  } catch (error) {
    return {
      usage: null,
      error: { type: "parse_error", message: error instanceof Error ? error.message : "Failed to parse API response" },
    };
  }
}

type AgentUsagePrefs = Preferences.AgentUsage;

// --- Dual-source auth hook ---

export function useZaiUsage(enabled = true): UsageState<ZaiUsage, ZaiError> {
  const [usage, setUsage] = useState<ZaiUsage | null>(null);
  const [error, setError] = useState<ZaiError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasInitialFetch, setHasInitialFetch] = useState<boolean>(false);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    const prefs = getPreferenceValues<AgentUsagePrefs>();

    // Dual-source: opencode auth.json first, then Raycast preference
    const token = readOpencodeAuthToken("zai-coding-plan") || (prefs.zaiApiToken as string | undefined)?.trim() || "";

    if (!token) {
      setUsage(null);
      setError({
        type: "not_configured",
        message: "z.ai token not found. Login via OpenCode (zai-coding-plan) or add it in extension settings (Cmd+,).",
      });
      setIsLoading(false);
      setHasInitialFetch(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await fetchZaiUsage(token);
    if (requestId !== requestIdRef.current) return;

    setUsage(result.usage);
    setError(result.error);
    setIsLoading(false);
    setHasInitialFetch(true);
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setUsage(null);
      setError(null);
      setIsLoading(false);
      setHasInitialFetch(false);
      return;
    }
    if (!hasInitialFetch) void fetchData();
  }, [enabled, hasInitialFetch, fetchData]);

  const revalidate = useCallback(async () => {
    if (!enabled) return;
    await fetchData();
  }, [enabled, fetchData]);

  return {
    isLoading: enabled ? isLoading : false,
    usage: enabled ? usage : null,
    error: enabled ? error : null,
    revalidate,
  };
}
