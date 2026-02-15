console.debug("[Conflict Translator] Discord content script loaded.");
const monitorUrl = chrome.runtime.getURL("assets/monitor.js");
import(monitorUrl)
  .then(({ startMessengerMonitor }) =>
    startMessengerMonitor({
		name: "Discord",
		inputSelector: "div[role=\"textbox\"]",
		messageSelector: "li.messageListItem",
		badgePlacement: "below"
	})
  )
  .catch((error) => {
    console.warn("[Conflict Translator] Discord monitor load failed.", error);
  });
