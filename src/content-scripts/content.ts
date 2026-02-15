import { startMessengerMonitor, type MessengerConfig } from "./monitor";
import { getSettings } from "../utils/storage";

console.log("[Conflict Translator] Content script loaded on", window.location.href);

const HOST = window.location.host;
const PATH = window.location.pathname;

const configs: MessengerConfig[] = [];

void (async () => {
  console.log("[Conflict Translator] Starting initialization...");
  const settings = await getSettings();
  console.log("[Conflict Translator] Settings loaded:", {
    autoAnalyzeOutgoing: settings.autoAnalyzeOutgoing,
    enableWhatsApp: settings.enableWhatsApp,
    anonymousMode: settings.anonymousMode,
    backendUrl: settings.backendUrl
  });

  if (HOST === "web.whatsapp.com" && settings.enableWhatsApp) {
    configs.push({
      name: "WhatsApp",
      inputSelector: [
        "footer div[contenteditable=\"true\"][role=\"textbox\"]",
        "footer div[contenteditable=\"true\"][data-tab]",
        "div[contenteditable=\"true\"][role=\"textbox\"]"
      ].join(", "),
      messageSelector: "div.message-in, div.message-out",
      badgePlacement: "right",
      authorRules: {
        self: ["message-out"],
        other: ["message-in"]
      }
    });
  }

  if (HOST === "web.telegram.org" && settings.enableTelegram) {
    configs.push({
      name: "Telegram",
      inputSelector: "div.input-message-input",
      messageSelector: "div.message",
      badgePlacement: "above",
      authorRules: {
        self: ["is-out", "message-out", "out"],
        other: ["is-in", "message-in", "in"]
      }
    });
  }

  if (HOST === "vk.com" && PATH.startsWith("/im") && settings.enableVK) {
    configs.push({
      name: "VK",
      inputSelector: "div[contenteditable].im-chat-input--text",
      messageSelector: "div.im-mess",
      badgePlacement: "right",
      authorRules: {
        self: ["im-mess--out"],
        other: ["im-mess--in"]
      }
    });
  }

  if (HOST === "discord.com" && PATH.startsWith("/channels") && settings.enableDiscord) {
    configs.push({
      name: "Discord",
      inputSelector: "div[role=\"textbox\"]",
      messageSelector: "li.messageListItem",
      badgePlacement: "below"
    });
  }

  configs.forEach((config) => {
    void startMessengerMonitor(config);
  });
})();
