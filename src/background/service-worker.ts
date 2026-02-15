import { requestDeepAnalysis } from "./api-client";
import { runQuickCheck } from "./ml-engine";
import { recordAnalysis, recordReplacement, type HistoryEntry } from "../utils/storage";

type QuickCheckMessage = {
  type: "quickCheck";
  text: string;
};

type DeepAnalysisMessage = {
  type: "deepAnalysis";
  text: string;
};

type BackendAnalyzeMessage = {
  type: "backendAnalyze";
  backendUrl: string;
  apiKey?: string;
  payload: {
    text: string;
    context: unknown[];
    ml_score: number;
    context_scoring?: boolean;
  };
};

type RecordAnalysisMessage = {
  type: "recordAnalysis";
  entry: HistoryEntry;
  anonymousMode: boolean;
};

type RecordReplacementMessage = {
  type: "recordReplacement";
  beforeSeverity: number;
  afterSeverity: number;
};

const ANALYZE_CACHE_TTL_MS = 60 * 1000;
const analyzeCache = new Map<string, { expiresAt: number; data: unknown }>();

function getCacheKey(payload: BackendAnalyzeMessage["payload"]) {
  try {
    return JSON.stringify(payload);
  } catch {
    return String(Date.now());
  }
}

chrome.runtime.onInstalled.addListener(() => {
  if (!chrome.storage?.sync) {
    return;
  }
  chrome.storage.sync.get(["onboardingCompleted"], (result) => {
    if (!result.onboardingCompleted) {
      const url = chrome.runtime.getURL("src/ui/onboarding/index.html");
      chrome.tabs.create({ url });
    }
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const payload = message as
    | QuickCheckMessage
    | DeepAnalysisMessage
    | BackendAnalyzeMessage
    | RecordAnalysisMessage
    | RecordReplacementMessage;

  if (payload.type === "quickCheck") {
    const severity = runQuickCheck(payload.text);
    sendResponse({ severity });
    return false;
  }

  if (payload.type === "deepAnalysis") {
    requestDeepAnalysis(payload.text)
      .then((analysis) => sendResponse(analysis))
      .catch((error) => sendResponse({ error: String(error) }));
    return true;
  }

  if (payload.type === "backendAnalyze") {
    const { backendUrl, payload: body, apiKey } = payload;
    const cacheKey = getCacheKey(body);
    const cached = analyzeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      sendResponse({ ok: true, data: cached.data, cached: true });
      return false;
    }
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }
    fetch(`${backendUrl}/api/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        analyzeCache.set(cacheKey, {
          expiresAt: Date.now() + ANALYZE_CACHE_TTL_MS,
          data
        });
        sendResponse({ ok: true, data });
      })
      .catch((error) => {
        console.error("[Conflict Translator SW] Backend analyze failed:", error);
        sendResponse({ ok: false, error: String(error) });
      });
    return true;
  }

  if (payload.type === "recordAnalysis") {
    console.log("[Conflict Translator SW] Recording analysis:", payload.entry.text?.substring(0, 30), "anonymousMode:", payload.anonymousMode);
    recordAnalysis(payload.entry, payload.anonymousMode)
      .then(() => {
        console.log("[Conflict Translator SW] Analysis recorded successfully");
        sendResponse({ ok: true });
      })
      .catch((error) => {
        console.error("[Conflict Translator SW] Failed to record analysis:", error);
        sendResponse({ ok: false, error: String(error) });
      });
    return true;
  }

  if (payload.type === "recordReplacement") {
    console.log("[Conflict Translator SW] Recording replacement");
    recordReplacement(payload.beforeSeverity, payload.afterSeverity)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  return false;
});
