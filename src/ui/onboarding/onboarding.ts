import { getSettings, setSettings } from "../../utils/storage";

const steps = Array.from(document.querySelectorAll<HTMLElement>(".step"));
const backButton = document.querySelector<HTMLButtonElement>("#back");
const nextButton = document.querySelector<HTMLButtonElement>("#next");

const whatsapp = document.querySelector<HTMLInputElement>("#onboard-whatsapp");
const telegram = document.querySelector<HTMLInputElement>("#onboard-telegram");
const vk = document.querySelector<HTMLInputElement>("#onboard-vk");
const discord = document.querySelector<HTMLInputElement>("#onboard-discord");

let index = 0;

function showStep(nextIndex: number) {
  index = Math.max(0, Math.min(steps.length - 1, nextIndex));
  steps.forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex === index);
  });
  if (backButton) {
    backButton.disabled = index === 0;
  }
  if (nextButton) {
    nextButton.textContent = index === steps.length - 1 ? "Finish" : "Next";
  }
}

async function finish() {
  const settings = await getSettings();
  await setSettings({
    enableWhatsApp: whatsapp?.checked ?? settings.enableWhatsApp,
    enableTelegram: telegram?.checked ?? settings.enableTelegram,
    enableVK: vk?.checked ?? settings.enableVK,
    enableDiscord: discord?.checked ?? settings.enableDiscord,
    onboardingCompleted: true
  });
  window.close();
}

backButton?.addEventListener("click", () => showStep(index - 1));
nextButton?.addEventListener("click", async () => {
  if (index === steps.length - 1) {
    await finish();
    return;
  }
  showStep(index + 1);
});

void (async () => {
  const settings = await getSettings();
  if (whatsapp) {
    whatsapp.checked = settings.enableWhatsApp;
  }
  if (telegram) {
    telegram.checked = settings.enableTelegram;
  }
  if (vk) {
    vk.checked = settings.enableVK;
  }
  if (discord) {
    discord.checked = settings.enableDiscord;
  }
})();

showStep(0);
