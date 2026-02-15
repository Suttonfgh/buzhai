import {
  clearHistory,
  getHistory,
  getSettings,
  setSettings
} from "../../utils/storage";

const sensitivity = document.querySelector<HTMLSelectElement>("#sensitivity");
const catInsults = document.querySelector<HTMLInputElement>("#cat-insults");
const catThreats = document.querySelector<HTMLInputElement>("#cat-threats");
const catHarassment = document.querySelector<HTMLInputElement>("#cat-harassment");
const catProfanity = document.querySelector<HTMLInputElement>("#cat-profanity");
const minSeverity = document.querySelector<HTMLInputElement>("#min-severity");
const autoSuggestThreshold = document.querySelector<HTMLSelectElement>("#auto-suggest-threshold");

const theme = document.querySelector<HTMLSelectElement>("#theme");
const badgePosition = document.querySelector<HTMLSelectElement>("#badge-position");
const showUnderline = document.querySelector<HTMLInputElement>("#show-underline");
const animations = document.querySelector<HTMLInputElement>("#animations");

const anonymousMode = document.querySelector<HTMLInputElement>("#anonymous-mode");
const clearHistoryButton = document.querySelector<HTMLButtonElement>("#clear-history");
const exportHistoryButton = document.querySelector<HTMLButtonElement>("#export-history");

const enableWhatsApp = document.querySelector<HTMLInputElement>("#enable-whatsapp");
const enableTelegram = document.querySelector<HTMLInputElement>("#enable-telegram");
const enableVK = document.querySelector<HTMLInputElement>("#enable-vk");
const enableDiscord = document.querySelector<HTMLInputElement>("#enable-discord");

const backendUrl = document.querySelector<HTMLInputElement>("#backend-url");
const backendKey = document.querySelector<HTMLInputElement>("#backend-key");

function setValue<T extends HTMLInputElement | HTMLSelectElement>(el: T | null, value: string | boolean | number) {
  if (!el) {
    return;
  }
  if (el instanceof HTMLInputElement && el.type === "checkbox") {
    el.checked = Boolean(value);
    return;
  }
  el.value = String(value);
}

async function loadSettings() {
  const settings = await getSettings();
  setValue(sensitivity, settings.detectionSensitivity);
  setValue(catInsults, settings.categories.insults);
  setValue(catThreats, settings.categories.threats);
  setValue(catHarassment, settings.categories.harassment);
  setValue(catProfanity, settings.categories.profanity);
  setValue(minSeverity, settings.minSeverity);
  setValue(autoSuggestThreshold, settings.autoSuggestThreshold);

  setValue(theme, settings.theme);
  setValue(badgePosition, settings.badgePosition);
  setValue(showUnderline, settings.showUnderline);
  setValue(animations, settings.animations);

  setValue(anonymousMode, settings.anonymousMode);

  setValue(enableWhatsApp, settings.enableWhatsApp);
  setValue(enableTelegram, settings.enableTelegram);
  setValue(enableVK, settings.enableVK);
  setValue(enableDiscord, settings.enableDiscord);

  setValue(backendUrl, settings.backendUrl);
  setValue(backendKey, settings.backendApiKey);
}

function onChange() {
  void setSettings({
    detectionSensitivity: sensitivity?.value as "low" | "medium" | "high",
    categories: {
      insults: Boolean(catInsults?.checked),
      threats: Boolean(catThreats?.checked),
      harassment: Boolean(catHarassment?.checked),
      profanity: Boolean(catProfanity?.checked)
    },
    minSeverity: Number(minSeverity?.value ?? 0),
    autoSuggestThreshold: Number(autoSuggestThreshold?.value ?? 80),
    theme: theme?.value as "auto" | "light" | "dark",
    badgePosition: badgePosition?.value as "auto" | "right" | "left" | "above" | "below",
    showUnderline: Boolean(showUnderline?.checked),
    animations: Boolean(animations?.checked),
    anonymousMode: Boolean(anonymousMode?.checked),
    enableWhatsApp: Boolean(enableWhatsApp?.checked),
    enableTelegram: Boolean(enableTelegram?.checked),
    enableVK: Boolean(enableVK?.checked),
    enableDiscord: Boolean(enableDiscord?.checked),
    backendUrl: backendUrl?.value || "http://127.0.0.1:8000",
    backendApiKey: backendKey?.value || ""
  });
}

[sensitivity, catInsults, catThreats, catHarassment, catProfanity, minSeverity, autoSuggestThreshold,
  theme, badgePosition, showUnderline, animations, anonymousMode,
  enableWhatsApp, enableTelegram, enableVK, enableDiscord, backendUrl, backendKey
].forEach((el) => el?.addEventListener("change", onChange));

clearHistoryButton?.addEventListener("click", async () => {
  await clearHistory();
  alert("History cleared.");
});

exportHistoryButton?.addEventListener("click", async () => {
  const history = await getHistory();
  const payload = JSON.stringify(history, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "conflict-translator-history.json";
  a.click();
  URL.revokeObjectURL(url);
});

void loadSettings();
