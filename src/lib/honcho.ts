import { Honcho } from "@honcho-ai/sdk";

function getApiUrl(): string {
  const stored = localStorage.getItem("honcho_api_url");
  if (stored) return stored;
  return "http://localhost:8000";
}

let _honcho: Honcho | null = null;

export function getHoncho(): Honcho {
  if (!_honcho) {
    const baseURL = import.meta.env.DEV ? "" : getApiUrl();
    _honcho = new Honcho({ baseURL });
  }
  return _honcho;
}

export function configureApiUrl(url: string): void {
  localStorage.setItem("honcho_api_url", url);
  const baseURL = import.meta.env.DEV ? "" : url;
  _honcho = new Honcho({ baseURL });
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
