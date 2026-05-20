import { useCallback, useState } from "react";
import { configureApiUrl, testConnection } from "@/lib/honcho";

export function useApiUrl() {
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem("honcho_api_url") || "http://localhost:8000";
  });

  const saveApiUrl = useCallback((url: string) => {
    const trimmed = url.trim();
    configureApiUrl(trimmed);
    setApiUrl(trimmed);
  }, []);

  return { apiUrl, saveApiUrl };
}

export function useConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const test = useCallback(async (url: string): Promise<boolean> => {
    setIsTesting(true);
    setIsConnected(null);
    try {
      const ok = await testConnection(url);
      setIsConnected(ok);
      return ok;
    } catch {
      setIsConnected(false);
      return false;
    } finally {
      setIsTesting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsConnected(null);
  }, []);

  return { isTesting, isConnected, test, reset };
}
