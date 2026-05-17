import { Honcho } from "@honcho-ai/sdk";

function getApiUrl(): string {
  const stored = localStorage.getItem("honcho_api_url");
  if (stored) return stored;
  return "http://localhost:8000";
}

let _honcho: Honcho | null = null;

export function getHoncho(): Honcho {
  if (!_honcho) {
    _honcho = new Honcho({ baseURL: getApiUrl() });
  }
  return _honcho;
}

export function configureApiUrl(url: string): void {
  localStorage.setItem("honcho_api_url", url);
  _honcho = new Honcho({ baseURL: url });
}

export async function testConnection(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
