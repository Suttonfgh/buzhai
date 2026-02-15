import { formatAverages, getSettings, getStats, setSettings } from "../../utils/storage";

const analyzedCount = document.querySelector("[data-stat=analyzed]");
const preventedCount = document.querySelector("[data-stat=prevented]");
const averageBefore = document.querySelector("[data-stat=avg-before]");
const averageAfter = document.querySelector("[data-stat=avg-after]");

const autoIncoming = document.querySelector<HTMLInputElement>("#auto-incoming");
const autoOutgoing = document.querySelector<HTMLInputElement>("#auto-outgoing");
const contextScoring = document.querySelector<HTMLInputElement>("#context-scoring");
const languageSelect = document.querySelector<HTMLSelectElement>("#interface-language");

const openHistory = document.querySelector("[data-link=history]");
const openSettings = document.querySelector("[data-link=settings]");
const openAbout = document.querySelector("[data-link=about]");

async function refreshStats() {
  const stats = await getStats();
  const averages = formatAverages(stats);
  if (analyzedCount) {
    analyzedCount.textContent = String(stats.analyzedCount);
  }
  if (preventedCount) {
    preventedCount.textContent = String(stats.conflictsPrevented);
  }
  if (averageBefore) {
    averageBefore.textContent = String(averages.before);
  }
  if (averageAfter) {
    averageAfter.textContent = averages.after === null ? "-" : String(averages.after);
  }
}

async function refreshSettings() {
  const settings = await getSettings();
  if (autoIncoming) {
    autoIncoming.checked = settings.autoAnalyzeIncoming;
  }
  if (autoOutgoing) {
    autoOutgoing.checked = settings.autoAnalyzeOutgoing;
  }
  if (contextScoring) {
    contextScoring.checked = settings.contextScoring;
  }
  if (languageSelect) {
    languageSelect.value = settings.interfaceLanguage;
  }
}

function openPage(path: string) {
  const url = chrome.runtime.getURL(path);
  chrome.tabs.create({ url });
}

autoIncoming?.addEventListener("change", () => {
  void setSettings({ autoAnalyzeIncoming: Boolean(autoIncoming.checked) });
});

autoOutgoing?.addEventListener("change", () => {
  void setSettings({ autoAnalyzeOutgoing: Boolean(autoOutgoing.checked) });
});

contextScoring?.addEventListener("change", () => {
  void setSettings({ contextScoring: Boolean(contextScoring.checked) });
});

languageSelect?.addEventListener("change", () => {
  void setSettings({ interfaceLanguage: languageSelect.value as "en" | "ru" });
});

openHistory?.addEventListener("click", () => openPage("src/ui/history/index.html"));
openSettings?.addEventListener("click", () => openPage("src/ui/settings/index.html"));
openAbout?.addEventListener("click", () => openPage("src/ui/about/index.html"));

chrome.storage?.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.analysisStats) {
    void refreshStats();
  }
  if (areaName === "sync") {
    void refreshSettings();
  }
});

void refreshStats();
void refreshSettings();
