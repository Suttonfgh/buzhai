import { debounce, waitForElement } from "../utils/dom-helpers";
import { createMessengerUI } from "./ui";
import {
  detectLanguage,
  extractMessageText,
  getTextMetadata
} from "../utils/text-analyzer";
import { getSettings, recordAnalysis, type Settings } from "../utils/storage";

export type MessageAuthor = "self" | "other" | "unknown";

export type MessengerConfig = {
  name: string;
  inputSelector: string;
  messageSelector: string;
  messageContainerSelector?: string;
  authorRules?: {
    self: string[];
    other: string[];
  };
  badgePlacement?: "right" | "above" | "below" | "left";
};

const DEFAULT_CONTEXT_SIZE = 8;
const INPUT_DEBOUNCE_MS = 500;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const CONNECTION_CHECK_MS = 5000;
const INPUT_WAIT_TIMEOUT_MS = 60 * 1000;
const MONITOR_RESTART_DELAY_MS = 2000;

function sendRuntimeMessage<T>(message: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!chrome.runtime?.sendMessage) {
      reject(new Error("runtime.sendMessage is unavailable"));
      return;
    }

    try {
      chrome.runtime.sendMessage(message, (response) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(new Error(lastError.message));
          return;
        }
        resolve(response as T);
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export async function startMessengerMonitor(
  config: MessengerConfig
): Promise<void> {
  try {
    let input = await waitForElement(config.inputSelector, {
      timeoutMs: INPUT_WAIT_TIMEOUT_MS
    });

    let settings = await getSettings();

    const createUi = (target: Element) => createMessengerUI(target, {
      name: config.name,
      badgePlacement: settings.badgePosition === "auto"
        ? config.badgePlacement
        : settings.badgePosition,
      minSeverity: settings.minSeverity,
      autoSuggestThreshold: settings.autoSuggestThreshold,
      showUnderline: settings.showUnderline,
      animations: settings.animations
    });

    let ui = createUi(input);

    let backendUrl = settings.backendUrl;
    let lastRequestId = 0;
    let idleTimerId: number | undefined;
    let isIdle = false;

    const markActive = () => {
      isIdle = false;
      if (idleTimerId !== undefined) {
        window.clearTimeout(idleTimerId);
      }
      idleTimerId = window.setTimeout(() => {
        isIdle = true;
      }, IDLE_TIMEOUT_MS);
    };

    const shouldAnalyze = () => !document.hidden && !isIdle && settings.autoAnalyzeOutgoing;

    const storageListener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName !== "sync") {
        return;
      }
      if (changes.contextScoring || changes.backendUrl || changes.minSeverity || changes.showUnderline
        || changes.animations || changes.badgePosition || changes.autoAnalyzeOutgoing
        || changes.autoSuggestThreshold
        || changes.detectionSensitivity || changes.categories || changes.anonymousMode) {
        getSettings().then((next) => {
          settings = next;
          backendUrl = next.backendUrl;
          ui.updateSettings({
            minSeverity: next.minSeverity,
            autoSuggestThreshold: next.autoSuggestThreshold,
            showUnderline: next.showUnderline,
            animations: next.animations,
            badgePlacement: next.badgePosition === "auto"
              ? config.badgePlacement
              : next.badgePosition
          });
        });
      }
    };
    chrome.storage?.onChanged.addListener(storageListener);

    const onVisibilityChange = () => {
      if (!document.hidden) {
        markActive();
      }
    };
    const onFocus = () => markActive();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    const onInput = debounce(() => {
      markActive();
      if (!shouldAnalyze()) {
        console.debug("[Conflict Translator] Skipping analysis - shouldAnalyze() returned false");
        return;
      }

      const text = readInputText(input);
      const normalized = text.trim();
      const context = collectContext(config, DEFAULT_CONTEXT_SIZE);

      if (!normalized) {
        console.debug("[Conflict Translator] Skipping analysis - empty text");
        return;
      }

      console.log("[Conflict Translator] Analyzing text:", normalized.substring(0, 50));

      const metadata = getTextMetadata(normalized);
      const language = detectLanguage(normalized);

      lastRequestId += 1;
      const requestId = lastRequestId;

      void getAnalysis(backendUrl, normalized, context, metadata, settings).then((result) => {
        console.log("[Conflict Translator] Analysis result:", result);
        if (requestId === lastRequestId) {
          ui.update(result);
          const entry = {
            text: normalized,
            severity: result.severity,
            emotions: result.emotions ?? [],
            needs: result.needs ?? [],
            timestamp: Date.now(),
            messenger: config.name,
            language
          };

          console.log("[Conflict Translator] Recording history entry:", entry);

          if (chrome.runtime?.sendMessage) {
            void sendRuntimeMessage<{ ok?: boolean }>({
              type: "recordAnalysis",
              entry,
              anonymousMode: settings.anonymousMode
            }).then(() => {
              console.log("[Conflict Translator] History recorded via service worker");
            }).catch(async (err) => {
              console.warn("[Conflict Translator] Service worker failed, using fallback:", err);
              await recordAnalysis(entry, settings.anonymousMode);
            });
          } else {
            console.log("[Conflict Translator] Using direct storage recording");
            void recordAnalysis(entry, settings.anonymousMode);
          }
        }
      }).catch((err) => {
        console.error("[Conflict Translator] Analysis failed:", err);
      });

      console.debug(`[Conflict Translator] ${config.name} input`, {
        text: normalized,
        language,
        metadata,
        context
      });
    }, INPUT_DEBOUNCE_MS);

    input.addEventListener("input", onInput);

    const onDocumentInput = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const matched = target.closest(config.inputSelector);
      if (!matched || matched === input) {
        return;
      }

      input.removeEventListener("input", onInput);
      ui.destroy();
      input = matched;
      ui = createUi(input);
      ui.updateSettings({
        minSeverity: settings.minSeverity,
        autoSuggestThreshold: settings.autoSuggestThreshold,
        showUnderline: settings.showUnderline,
        animations: settings.animations,
        badgePlacement: settings.badgePosition === "auto"
          ? config.badgePlacement
          : settings.badgePosition
      });
      input.addEventListener("input", onInput);
      console.log(`[Conflict Translator] ${config.name} rebound to new input node`);
    };
    document.addEventListener("input", onDocumentInput, true);

    markActive();

    const connectionTimer = window.setInterval(() => {
      if (!input.isConnected) {
        input.removeEventListener("input", onInput);
        document.removeEventListener("input", onDocumentInput, true);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("focus", onFocus);
        chrome.storage?.onChanged.removeListener(storageListener);
        if (idleTimerId !== undefined) {
          window.clearTimeout(idleTimerId);
        }
        window.clearInterval(connectionTimer);
        ui.destroy();
        window.setTimeout(() => {
          void startMessengerMonitor(config);
        }, MONITOR_RESTART_DELAY_MS);
      }
    }, CONNECTION_CHECK_MS);
  } catch (error) {
    console.warn(`[Conflict Translator] ${config.name} input not found.`, error);
    window.setTimeout(() => {
      void startMessengerMonitor(config);
    }, MONITOR_RESTART_DELAY_MS);
  }
}

async function getSeverity(
  text: string,
  metadata: ReturnType<typeof getTextMetadata>,
  settings: Settings
) {
  if (!chrome.runtime?.sendMessage) {
    return localSeverityScore(text, metadata, settings);
  }

  try {
    const response = await sendRuntimeMessage<{ severity?: number }>({
      type: "quickCheck",
      text
    });
    if (response && typeof response.severity === "number") {
      return response.severity;
    }
  } catch (error) {
    console.warn("[Conflict Translator] Quick check failed", error);
  }

  return localSeverityScore(text, metadata, settings);
}

function localSeverityScore(
  text: string,
  metadata: ReturnType<typeof getTextMetadata>,
  settings: Settings
) {
  const normalized = text.toLowerCase();
  let score = 0;

  if (normalized.includes("always") || normalized.includes("never")) {
    score += 20;
  }

  if (settings.categories.insults) {
    if (normalized.includes("stupid") || normalized.includes("idiot") || normalized.includes("hate")) {
      score += 40;
    }
  }

  if (settings.categories.threats) {
    if (normalized.includes("kill") || normalized.includes("ruin") || normalized.includes("destroy")) {
      score += 50;
    }
  }

  if (settings.categories.harassment) {
    if (normalized.includes("shut up") || normalized.includes("loser")) {
      score += 30;
    }
  }

  if (settings.categories.profanity) {
    if (normalized.includes("damn") || normalized.includes("hell")) {
      score += 20;
    }
  }

  if (metadata.capsRatio > 0.3) {
    score += 15;
  }

  if (metadata.punctuationCount >= 3) {
    score += 15;
  }

  const multiplier = settings.detectionSensitivity === "high"
    ? 1.2
    : settings.detectionSensitivity === "low"
      ? 0.8
      : 1;

  return Math.min(100, Math.round(score * multiplier));
}

type AnalysisResult = {
  text: string;
  severity: number;
  emotions?: string[];
  needs?: string[];
  alternatives?: {
    empathic: string;
    rational: string;
    socratic: string;
  };
};

async function getAnalysis(
  backendUrl: string,
  text: string,
  context: ReturnType<typeof collectContext>,
  metadata: ReturnType<typeof getTextMetadata>,
  settings: Settings,
): Promise<AnalysisResult> {
  const fallbackSeverity = await getSeverity(text, metadata, settings);
  const fallback = {
    text,
    severity: fallbackSeverity
  };

  if (!chrome.runtime?.sendMessage) {
    console.warn("[Conflict Translator] Extension context invalidated - using fallback");
    return fallback;
  }

  try {
    const response = await sendRuntimeMessage<{ ok?: boolean; data?: unknown }>({
      type: "backendAnalyze",
      backendUrl,
      apiKey: settings.backendApiKey || undefined,
      payload: {
        text,
        context,
        ml_score: fallbackSeverity,
        context_scoring: settings.contextScoring
      }
    });

    if (!response || response.ok !== true) {
      return fallback;
    }

    const data = response.data as {
      emotions?: string[];
      needs?: string[];
      alternatives?: {
        empathic?: string;
        rational?: string;
        socratic?: string;
      };
      escalation?: number;
    };

    const result = {
      text,
      severity: typeof data.escalation === "number" ? data.escalation : fallbackSeverity,
      emotions: data.emotions ?? [],
      needs: data.needs ?? [],
      alternatives: data.alternatives
        ? {
            empathic: data.alternatives.empathic ?? "",
            rational: data.alternatives.rational ?? "",
            socratic: data.alternatives.socratic ?? ""
          }
        : undefined
    };
    
    return result;
  } catch (error) {
    console.warn("[Conflict Translator] Backend analyze failed", error);
    return fallback;
  }
}

function readInputText(input: Element): string {
  if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
    return input.value ?? "";
  }

  return input.textContent ?? "";
}

function collectContext(config: MessengerConfig, limit: number) {
  const root = config.messageContainerSelector
    ? document.querySelector(config.messageContainerSelector)
    : document;
  const nodes = root
    ? Array.from(root.querySelectorAll(config.messageSelector))
    : [];
  const slice = nodes.slice(-limit);

  return slice.map((node) => {
    const text = extractMessageText(node as Element);
    return {
      text,
      language: detectLanguage(text),
      metadata: getTextMetadata(text),
      author: inferAuthor(node as Element, config),
      timestamp: extractTimestamp(node as Element)
    };
  });
}

function inferAuthor(element: Element, config: MessengerConfig): MessageAuthor {
  if (!config.authorRules) {
    return "unknown";
  }

  const className = element.className;
  for (const marker of config.authorRules.self) {
    if (className.includes(marker)) {
      return "self";
    }
  }

  for (const marker of config.authorRules.other) {
    if (className.includes(marker)) {
      return "other";
    }
  }

  return "unknown";
}

function extractTimestamp(element: Element): string | null {
  const timeElement = element.querySelector("time");
  if (timeElement) {
    return timeElement.getAttribute("datetime") ?? timeElement.textContent;
  }

  const dataTime = element.getAttribute("data-pre-plain-text");
  if (dataTime) {
    return dataTime;
  }

  return null;
}
