console.debug("[Conflict Translator] VK content script loaded.");
const monitorUrl = chrome.runtime.getURL("assets/monitor.js");
import(monitorUrl)
  .then(({ startMessengerMonitor }) =>
    startMessengerMonitor({
		name: "VK",
		inputSelector: "div[contenteditable].im-chat-input--text",
		messageSelector: "div.im-mess",
		badgePlacement: "right",
		authorRules: {
			self: ["im-mess--out"],
			other: ["im-mess--in"]
		}
	})
  )
  .catch((error) => {
    console.warn("[Conflict Translator] VK monitor load failed.", error);
  });
