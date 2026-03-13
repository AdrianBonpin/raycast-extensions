import { readOpencodeAuthToken } from "../agents/opencode-auth";

/**
 * Resolves the Synthetic API token.
 * Priority: ~/.local/share/opencode/auth.json ("synthetic" entry) → Raycast preference (syntheticApiToken)
 */
export function resolveSyntheticToken(preferenceToken?: string): string | null {
  const opencodeToken = readOpencodeAuthToken("synthetic");
  if (opencodeToken) return opencodeToken;
  const pref = preferenceToken?.trim() || "";
  return pref || null;
}
