export type Settings = {
  autoAnalyzeIncoming: boolean;
  autoAnalyzeOutgoing: boolean;
  interfaceLanguage: "en" | "ru";
  detectionSensitivity: "low" | "medium" | "high";
  categories: {
    insults: boolean;
    threats: boolean;
    harassment: boolean;
    profanity: boolean;
  };
  minSeverity: number;
  autoSuggestThreshold: number;
  theme: "auto" | "light" | "dark";
  badgePosition: "auto" | "right" | "left" | "above" | "below";
  showUnderline: boolean;
  animations: boolean;
  anonymousMode: boolean;
  enableWhatsApp: boolean;
  enableTelegram: boolean;
  enableVK: boolean;
  enableDiscord: boolean;
  backendUrl: string;
  backendApiKey: string;
  contextScoring: boolean;
  onboardingCompleted: boolean;
};

export type HistoryEntry = {
  text: string;
  severity: number;
  emotions: string[];
  needs: string[];
  timestamp: number;
  messenger: string;
  language: string;
};

export type Stats = {
  analyzedCount: number;
  conflictsPrevented: number;
  sumSeverityBefore: number;
  sumSeverityAfter: number;
  replacementCount: number;
};

const DEFAULT_SETTINGS: Settings = {
  autoAnalyzeIncoming: false,
  autoAnalyzeOutgoing: true,
  interfaceLanguage: "en",
  detectionSensitivity: "medium",
  categories: {
    insults: true,
    threats: true,
    harassment: true,
    profanity: true
  },
  minSeverity: 0,
  autoSuggestThreshold: 80,
  theme: "auto",
  badgePosition: "auto",
  showUnderline: true,
  animations: true,
  anonymousMode: false,
  enableWhatsApp: true,
  enableTelegram: true,
  enableVK: true,
  enableDiscord: true,
  backendUrl: "http://127.0.0.1:8000",
  backendApiKey: "",
  contextScoring: false,
  onboardingCompleted: false
};

const DEFAULT_STATS: Stats = {
  analyzedCount: 0,
  conflictsPrevented: 0,
  sumSeverityBefore: 0,
  sumSeverityAfter: 0,
  replacementCount: 0
};

const HISTORY_LIMIT = 100;

export function getDefaultSettings(): Settings {
  return { ...DEFAULT_SETTINGS, categories: { ...DEFAULT_SETTINGS.categories } };
}

export async function getSettings(): Promise<Settings> {
  if (!chrome.storage?.sync) {
    return getDefaultSettings();
  }

  return new Promise((resolve) => {
    chrome.storage.sync.get(getDefaultSettings(), (result) => {
      const merged: Settings = {
        ...getDefaultSettings(),
        ...result,
        categories: {
          ...DEFAULT_SETTINGS.categories,
          ...(result.categories as Settings["categories"] | undefined)
        }
      };
      resolve(merged);
    });
  });
}

export async function setSettings(partial: Partial<Settings>): Promise<void> {
  if (!chrome.storage?.sync) {
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.sync.set(partial, () => resolve());
  });
}

export async function getHistory(): Promise<HistoryEntry[]> {
  if (!chrome.storage?.local) {
    return [];
  }
  return new Promise((resolve) => {
    chrome.storage.local.get(["analysisHistory"], (result) => {
      resolve((result.analysisHistory as HistoryEntry[]) ?? []);
    });
  });
}

export async function setHistory(history: HistoryEntry[]): Promise<void> {
  if (!chrome.storage?.local) {
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ analysisHistory: history }, () => resolve());
  });
}

export async function clearHistory(): Promise<void> {
  if (!chrome.storage?.local) {
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ analysisHistory: [] }, () => resolve());
  });
}

export async function getStats(): Promise<Stats> {
  if (!chrome.storage?.local) {
    return { ...DEFAULT_STATS };
  }
  return new Promise((resolve) => {
    chrome.storage.local.get(["analysisStats"], (result) => {
      resolve({ ...DEFAULT_STATS, ...(result.analysisStats as Stats | undefined) });
    });
  });
}

export async function setStats(stats: Stats): Promise<void> {
  if (!chrome.storage?.local) {
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ analysisStats: stats }, () => resolve());
  });
}

export async function recordAnalysis(entry: HistoryEntry, anonymousMode: boolean): Promise<void> {
  const stats = await getStats();
  const updatedStats: Stats = {
    ...stats,
    analyzedCount: stats.analyzedCount + 1,
    sumSeverityBefore: stats.sumSeverityBefore + entry.severity
  };
  await setStats(updatedStats);

  if (anonymousMode) {
    return;
  }

  const history = await getHistory();
  history.push(entry);
  if (history.length > HISTORY_LIMIT) {
    history.splice(0, history.length - HISTORY_LIMIT);
  }
  await setHistory(history);
}

export async function recordReplacement(beforeSeverity: number, afterSeverity: number): Promise<void> {
  const stats = await getStats();
  const conflictsPrevented = beforeSeverity > afterSeverity
    ? stats.conflictsPrevented + 1
    : stats.conflictsPrevented;
  const updated: Stats = {
    ...stats,
    conflictsPrevented,
    sumSeverityAfter: stats.sumSeverityAfter + afterSeverity,
    replacementCount: stats.replacementCount + 1
  };
  await setStats(updated);
}

export function formatAverages(stats: Stats): { before: number; after: number | null } {
  const before = stats.analyzedCount > 0
    ? Math.round(stats.sumSeverityBefore / stats.analyzedCount)
    : 0;
  const after = stats.replacementCount > 0
    ? Math.round(stats.sumSeverityAfter / stats.replacementCount)
    : null;
  return { before, after };
}
