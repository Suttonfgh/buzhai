console.debug("[Conflict Translator] WhatsApp content script loaded.");
const monitorUrl = chrome.runtime.getURL("assets/monitor.js");
import(monitorUrl)
  .then(({ startMessengerMonitor }) =>
    startMessengerMonitor({
		name: "WhatsApp",
		inputSelector: "div[contenteditable=\"true\"][data-tab=\"10\"]",
		messageSelector: "div.message-in, div.message-out",
		badgePlacement: "right",
		authorRules: {
			self: ["message-out"],
			other: ["message-in"]
		}
	})
  )
  .catch((error) => {
    console.warn("[Conflict Translator] WhatsApp monitor load failed.", error);
  });
