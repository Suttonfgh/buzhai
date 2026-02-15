console.debug("[Conflict Translator] Telegram content script loaded.");
const monitorUrl = chrome.runtime.getURL("assets/monitor.js");
import(monitorUrl)
  .then(({ startMessengerMonitor }) =>
    startMessengerMonitor({
		name: "Telegram",
		inputSelector: "div.input-message-input",
		messageSelector: "div.message",
		badgePlacement: "above",
		authorRules: {
			self: ["is-out", "message-out", "out"],
			other: ["is-in", "message-in", "in"]
		}
	})
  )
  .catch((error) => {
    console.warn("[Conflict Translator] Telegram monitor load failed.", error);
  });
