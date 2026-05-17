import { Honcho } from "@honcho-ai/sdk";

let _workspaceId = "default";
let _honcho: Honcho | null = null;

function getApiUrl(): string {
  const stored = localStorage.getItem("honcho_api_url");
  if (stored) return stored;
  return "http://localhost:8000";
}

export function getHoncho(workspaceId?: string): Honcho {
  const wid = workspaceId ?? _workspaceId;
  // Recreate if workspace changed or not initialized
  if (!_honcho || (workspaceId && workspaceId !== _workspaceId)) {
    _workspaceId = wid;
    const baseURL = import.meta.env.DEV ? window.location.origin : getApiUrl();
    _honcho = new Honcho({ baseURL, workspaceId: wid });
  }
  return _honcho;
}

export function configureApiUrl(url: string): void {
  localStorage.setItem("honcho_api_url", url);
  const baseURL = import.meta.env.DEV ? window.location.origin : url;
  _honcho = new Honcho({ baseURL, workspaceId: _workspaceId });
}

export async function testConnection(_url: string): Promise<boolean> {
  try {
    const healthUrl = import.meta.env.DEV ? "/health" : `${_url}/health`;
    const res = await fetch(healthUrl);
    return res.ok;
  } catch {
    return false;
  }
}
