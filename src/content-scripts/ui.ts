import { detectLanguage, getTextMetadata, normalizeText } from "../utils/text-analyzer";
import { recordReplacement } from "../utils/storage";

export type BadgePlacement = "right" | "above" | "below" | "left";

export type UIConfig = {
  name: string;
  badgePlacement?: BadgePlacement;
  minSeverity?: number;
  autoSuggestThreshold?: number;
  showUnderline?: boolean;
  animations?: boolean;
  onReplace?: (value: string, beforeSeverity: number) => void;
};

export type AnalysisPayload = {
  text: string;
  severity: number;
  emotions?: string[];
  needs?: string[];
  alternatives?: Alternatives;
};

type UIState = {
  severity: number;
  text: string;
  emotions: string[];
  needs: string[];
  alternatives: Alternatives;
};

const STYLE_ID = "ct-ui-style";
const HISTORY_LIMIT = 100;
const HISTORY_ROW_HEIGHT = 44;
const HISTORY_VIEWPORT_HEIGHT = 220;
const DEFAULT_AUTO_SUGGEST_THRESHOLD = 80;

type HistoryEntry = {
  text: string;
  severity: number;
  emotions: string[];
  needs: string[];
  timestamp: number;
};

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

export function createMessengerUI(input: Element, config: UIConfig) {
  ensureStyles();

  const root = document.createElement("div");
  root.className = "ct-root";

  const badge = document.createElement("button");
  badge.className = "ct-badge";
  badge.type = "button";
  badge.textContent = "0/100";

  const popup = document.createElement("div");
  popup.className = "ct-popup ct-hidden";

  const sidebar = document.createElement("div");
  sidebar.className = "ct-sidebar";

  root.appendChild(badge);
  root.appendChild(popup);
  root.appendChild(sidebar);
  document.body.appendChild(root);

  let state: UIState = {
    severity: 0,
    text: "",
    emotions: [],
    needs: [],
    alternatives: generateAlternatives("")
  };

  let minSeverity = config.minSeverity ?? 0;
  let autoSuggestThreshold = config.autoSuggestThreshold ?? DEFAULT_AUTO_SUGGEST_THRESHOLD;
  let showUnderline = config.showUnderline ?? true;
  let animations = config.animations ?? true;
  let lastAutoSuggestionKey = "";
  let dismissedSuggestionKey = "";

  const history: HistoryEntry[] = [];

  badge.addEventListener("click", () => {
    popup.classList.toggle("ct-hidden");
    renderPopup(
      popup,
      state,
      input,
      sidebar,
      history,
      minSeverity,
      autoSuggestThreshold,
      config.onReplace
    );
  });

  const onResize = () => positionElements();
  const onScroll = () => positionElements();
  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onScroll, true);

  function update(payload: AnalysisPayload) {
    state = {
      severity: payload.severity,
      text: payload.text,
      emotions: payload.emotions ?? [],
      needs: payload.needs ?? [],
      alternatives: payload.alternatives ?? generateAlternatives(payload.text)
    };

    if (payload.text && history.at(-1)?.text !== payload.text) {
      history.push({
        text: payload.text,
        severity: payload.severity,
        emotions: state.emotions,
        needs: state.needs,
        timestamp: Date.now()
      });
      if (history.length > HISTORY_LIMIT) {
        history.splice(0, history.length - HISTORY_LIMIT);
      }
    }

    const suggestionKey = `${payload.text}:${payload.severity}`;
    const canAutoSuggest = payload.severity >= Math.max(minSeverity, autoSuggestThreshold)
      && payload.text.trim().length > 0
      && suggestionKey !== dismissedSuggestionKey
      && suggestionKey !== lastAutoSuggestionKey;

    if (canAutoSuggest) {
      popup.classList.remove("ct-hidden");
      lastAutoSuggestionKey = suggestionKey;
    }

    updateBadge(badge, payload.severity, minSeverity, animations);
    updateUnderline(input, payload.severity, minSeverity, showUnderline);
    renderPopup(
      popup,
      state,
      input,
      sidebar,
      history,
      minSeverity,
      autoSuggestThreshold,
      config.onReplace,
      (key) => {
        dismissedSuggestionKey = key;
      }
    );
    positionElements();
  }

  function positionElements() {
    const rect = input.getBoundingClientRect();
    positionBadge(badge, rect, config.badgePlacement ?? "right");
    positionPopup(popup, rect, config.badgePlacement ?? "right");
    positionSidebar(sidebar);
  }

  function destroy() {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onScroll, true);
    root.remove();
  }

  function updateSettings(next: {
    minSeverity?: number;
    autoSuggestThreshold?: number;
    showUnderline?: boolean;
    animations?: boolean;
    badgePlacement?: BadgePlacement;
  }) {
    if (typeof next.minSeverity === "number") {
      minSeverity = next.minSeverity;
    }
    if (typeof next.showUnderline === "boolean") {
      showUnderline = next.showUnderline;
    }
    if (typeof next.autoSuggestThreshold === "number") {
      autoSuggestThreshold = next.autoSuggestThreshold;
    }
    if (typeof next.animations === "boolean") {
      animations = next.animations;
    }
    if (next.badgePlacement) {
      config.badgePlacement = next.badgePlacement;
    }
    updateBadge(badge, state.severity, minSeverity, animations);
    updateUnderline(input, state.severity, minSeverity, showUnderline);
    positionElements();
  }

  return { update, updateSettings, destroy };
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
.ct-root {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 2147483646;
  pointer-events: none;
  font-family: "Segoe UI", Arial, sans-serif;
}

.ct-badge {
  position: fixed;
  pointer-events: auto;
  border: none;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #101010;
  background: #c7f2c2;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: transform 150ms ease, box-shadow 150ms ease, filter 150ms ease;
}

.ct-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  filter: saturate(1.05);
}

.ct-badge:focus-visible {
  outline: 2px solid #1c1c1c;
  outline-offset: 2px;
}

.ct-badge.ct-mid {
  background: #ffd9a1;
}

.ct-badge.ct-high {
  background: #ffb0a6;
}

.ct-pulse {
  animation: ct-pulse 1.4s ease-in-out infinite;
}

@keyframes ct-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.ct-popup {
  position: fixed;
  width: 360px;
  max-width: min(92vw, 380px);
  max-height: 60vh;
  background: #f6f3eb;
  color: #171717;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  overflow: auto;
  transition: opacity 200ms ease, transform 200ms ease;
}

.ct-popup.ct-hidden {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
}

.ct-popup h4 {
  margin: 0 0 8px;
  font-size: 14px;
  letter-spacing: 0.2px;
}

.ct-popup .ct-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 4px 0;
  gap: 10px;
}

.ct-popup .ct-actions {
  margin-top: 10px;
  display: grid;
  gap: 6px;
}

.ct-popup .ct-suggestions {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.ct-popup .ct-suggestion-item {
  background: #ffffff;
  border: 1px solid #ddd2c1;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.35;
  display: grid;
  gap: 6px;
}

.ct-popup .ct-suggestion-title {
  font-weight: 600;
  display: flex;
  gap: 6px;
  align-items: center;
}

.ct-popup .ct-suggestion-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.ct-popup .ct-suggestion-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ct-button {
  border: 1px solid #1c1c1c;
  background: #ffffff;
  color: #1c1c1c;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.ct-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.ct-button:focus-visible {
  outline: 2px solid #1c1c1c;
  outline-offset: 2px;
}

.ct-button.ct-primary {
  background: #1c1c1c;
  color: #ffffff;
}

.ct-button.ct-secondary {
  border-color: #555555;
  color: #333333;
}

.ct-sidebar {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  overflow: auto;
  z-index: 2147483646;
  background: #f9f7f2;
  color: #1c1c1c;
  border-radius: 16px;
  border: 2px solid #1c1c1c;
  padding: 16px 16px 18px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
  transform: translateX(110%);
  transition: transform 220ms ease;
  pointer-events: auto;
}

.ct-sidebar.ct-visible {
  transform: translateX(0%);
}

.ct-sidebar h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.ct-sidebar .ct-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.ct-sidebar .ct-tab {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #1c1c1c;
  background: #ffffff;
}

.ct-sidebar .ct-metrics {
  background: #ffffff;
  border: 1px solid #1c1c1c;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.ct-context {
  margin: 12px 0;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #1c1c1c;
  padding: 10px 12px;
}

.ct-context-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ct-context-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #e8e1d3;
  font-size: 12px;
}

.ct-context-row:last-child {
  border-bottom: none;
}

.ct-context-text {
  color: #1c1c1c;
}

.ct-context-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5a5247;
  white-space: nowrap;
}

.ct-context-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 18px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: #d7efd2;
  border: 1px solid #1c1c1c;
}

.ct-context-badge.ct-mid {
  background: #ffe0b6;
}

.ct-context-badge.ct-high {
  background: #ffc3bc;
}

.ct-history {
  margin: 12px 0;
  background: #161616;
  border-radius: 12px;
  padding: 8px;
}

.ct-history-viewport {
  position: relative;
  overflow-y: auto;
  max-height: 220px;
}

.ct-history-spacer {
  width: 100%;
}

.ct-history-items {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.ct-history-row {
  display: grid;
  grid-template-columns: 64px 1fr 64px;
  gap: 8px;
  padding: 6px 8px;
  font-size: 11px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ct-history-score {
  font-weight: 600;
}

.ct-history-text {
  color: #d7d1c4;
}

.ct-history-time {
  text-align: right;
  color: #a59f92;
}

.ct-underline {
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-color: #ff5c5c;
  text-decoration-thickness: 2px;
}
`;
  document.head.appendChild(style);
}

function updateBadge(
  badge: HTMLButtonElement,
  severity: number,
  minSeverity: number,
  animations: boolean
) {
  const shouldShow = severity >= minSeverity;
  badge.style.display = shouldShow ? "inline-flex" : "none";
  badge.textContent = `${severity}/100`;
  badge.classList.remove("ct-mid", "ct-high", "ct-pulse");

  if (severity >= 70) {
    badge.classList.add("ct-high");
    if (animations) {
      badge.classList.add("ct-pulse");
    }
  } else if (severity >= 40) {
    badge.classList.add("ct-mid");
  }
}

function updateUnderline(
  input: Element,
  severity: number,
  minSeverity: number,
  showUnderline: boolean
) {
  if (!(input instanceof HTMLElement)) {
    return;
  }

  if (!showUnderline || severity < Math.max(50, minSeverity)) {
    input.classList.remove("ct-underline");
    return;
  }

  if (severity >= 50) {
    input.classList.add("ct-underline");
  } else {
    input.classList.remove("ct-underline");
  }
}

function renderPopup(
  popup: HTMLDivElement,
  state: UIState,
  input: Element,
  sidebar: HTMLDivElement,
  history: HistoryEntry[],
  minSeverity: number,
  autoSuggestThreshold: number,
  onReplace?: (value: string, beforeSeverity: number) => void,
  onDismissSuggestion?: (key: string) => void
) {
  if (popup.classList.contains("ct-hidden")) {
    return;
  }

  if (state.severity < minSeverity) {
    popup.classList.add("ct-hidden");
    return;
  }

  const summary = getSeverityLabel(state.severity);
  const alternatives = state.alternatives;
  const emotionLabel = state.emotions[0] ?? guessEmotion(state.severity);
  const needLabel = state.needs[0] ?? guessNeed(state.severity);
  const showSuggestions = true;

  const empathicPreview = truncateText(alternatives.empathic, 90);
  const rationalPreview = truncateText(alternatives.rational, 90);
  const socraticPreview = truncateText(alternatives.socratic, 90);

  popup.innerHTML = `
    <h4>${summary} (${state.severity}/100)</h4>
    <div class="ct-row"><span>Emotion</span><span>${emotionLabel}</span></div>
    <div class="ct-row"><span>Need</span><span>${needLabel}</span></div>
    ${showSuggestions ? `
      <div class="ct-suggestions">
        <div class="ct-suggestion-item" data-style="empathic">
          <div class="ct-suggestion-title">🤝 Empathic</div>
          <div class="ct-suggestion-text" data-full="${escapeHtml(alternatives.empathic)}" data-preview="${escapeHtml(empathicPreview)}">${escapeHtml(empathicPreview)}</div>
          <div class="ct-suggestion-actions">
            <button class="ct-button" data-action="preview">Preview full</button>
            <button class="ct-button ct-primary" data-action="replace" data-value="${escapeHtml(alternatives.empathic)}">Use this</button>
          </div>
        </div>
        <div class="ct-suggestion-item" data-style="rational">
          <div class="ct-suggestion-title">🧠 Rational</div>
          <div class="ct-suggestion-text" data-full="${escapeHtml(alternatives.rational)}" data-preview="${escapeHtml(rationalPreview)}">${escapeHtml(rationalPreview)}</div>
          <div class="ct-suggestion-actions">
            <button class="ct-button" data-action="preview">Preview full</button>
            <button class="ct-button ct-primary" data-action="replace" data-value="${escapeHtml(alternatives.rational)}">Use this</button>
          </div>
        </div>
        <div class="ct-suggestion-item" data-style="socratic">
          <div class="ct-suggestion-title">❓ Socratic</div>
          <div class="ct-suggestion-text" data-full="${escapeHtml(alternatives.socratic)}" data-preview="${escapeHtml(socraticPreview)}">${escapeHtml(socraticPreview)}</div>
          <div class="ct-suggestion-actions">
            <button class="ct-button" data-action="preview">Preview full</button>
            <button class="ct-button ct-primary" data-action="replace" data-value="${escapeHtml(alternatives.socratic)}">Use this</button>
          </div>
        </div>
      </div>
    ` : ""}
    <div class="ct-actions">
      <button class="ct-button ct-secondary" data-action="details">More details</button>
      <button class="ct-button ct-secondary" data-action="dismiss">Dismiss</button>
    </div>
  `;

  popup.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const action = (button as HTMLButtonElement).dataset.action;
      if (action === "replace") {
        const value = (button as HTMLButtonElement).dataset.value ?? "";
        replaceInputValue(input, value);
        void handleReplacement(value, state.severity, onReplace);
        popup.classList.add("ct-hidden");
      }

      if (action === "preview") {
        const item = button.closest(".ct-suggestion-item");
        const textEl = item?.querySelector(".ct-suggestion-text") as HTMLElement | null;
        if (!textEl) {
          return;
        }
        const isExpanded = textEl.dataset.expanded === "true";
        const full = textEl.dataset.full ?? "";
        const preview = textEl.dataset.preview ?? "";
        textEl.textContent = isExpanded ? preview : full;
        textEl.dataset.expanded = isExpanded ? "false" : "true";
        (button as HTMLButtonElement).textContent = isExpanded ? "Preview full" : "Collapse";
      }

      if (action === "details") {
        sidebar.classList.add("ct-visible");
        renderSidebar(sidebar, state, history);
        positionSidebar(sidebar);
      }

      if (action === "dismiss") {
        popup.classList.add("ct-hidden");
        onDismissSuggestion?.(`${state.text}:${state.severity}`);
      }
    });
  });
}

async function handleReplacement(
  value: string,
  beforeSeverity: number,
  onReplace?: (value: string, beforeSeverity: number) => void
) {
  if (onReplace) {
    onReplace(value, beforeSeverity);
    return;
  }

  if (!chrome.runtime?.sendMessage) {
    return;
  }

  try {
    const response = await sendRuntimeMessage<{ severity?: number }>({
      type: "quickCheck",
      text: value
    });
    const afterSeverity = typeof response?.severity === "number"
      ? response.severity
      : beforeSeverity;
    try {
      await sendRuntimeMessage<{ ok?: boolean }>({
        type: "recordReplacement",
        beforeSeverity,
        afterSeverity
      });
    } catch {
      await recordReplacement(beforeSeverity, afterSeverity);
    }
  } catch {
    if (chrome.runtime?.sendMessage) {
      try {
        await sendRuntimeMessage<{ ok?: boolean }>({
          type: "recordReplacement",
          beforeSeverity,
          afterSeverity: beforeSeverity
        });
        return;
      } catch {
        await recordReplacement(beforeSeverity, beforeSeverity);
        return;
      }
    }
    await recordReplacement(beforeSeverity, beforeSeverity);
  }
}

function renderSidebar(sidebar: HTMLDivElement, state: UIState, history: HistoryEntry[]) {
  const metadata = getTextMetadata(state.text);
  const emotions = state.emotions.length ? state.emotions.join(", ") : "-";
  const needs = state.needs.length ? state.needs.join(", ") : "-";
  const contextItems = history.slice(-3).reverse();
  sidebar.innerHTML = `
    <h3>Conflict Translator</h3>
    <div class="ct-tabs">
      <span class="ct-tab">Analysis</span>
      <span class="ct-tab">History</span>
      <span class="ct-tab">Settings</span>
    </div>
    <div class="ct-metrics">
      <div><strong>Severity:</strong> ${state.severity}/100</div>
      <div><strong>Emotions:</strong> ${emotions}</div>
      <div><strong>Needs:</strong> ${needs}</div>
      <div><strong>Language:</strong> ${detectLanguage(state.text)}</div>
      <div><strong>Caps ratio:</strong> ${metadata.capsRatio.toFixed(2)}</div>
      <div><strong>Punctuation:</strong> ${metadata.punctuationCount}</div>
      <div><strong>Length:</strong> ${metadata.length}</div>
    </div>
    <div class="ct-context">
      <div class="ct-context-title">Conversation Context</div>
      ${contextItems.length === 0 ? "<div class=\"ct-context-text\">No recent messages.</div>" : contextItems.map((entry) => {
        const badgeClass = entry.severity >= 70
          ? "ct-high"
          : entry.severity >= 40
            ? "ct-mid"
            : "";
        const text = escapeHtml(entry.text).slice(0, 80);
        const time = new Date(entry.timestamp).toLocaleTimeString();
        return `
          <div class=\"ct-context-row\">
            <div class=\"ct-context-text\">${text}</div>
            <div class=\"ct-context-meta\">
              <span class=\"ct-context-badge ${badgeClass}\">${entry.severity}</span>
              <span>${time}</span>
            </div>
          </div>
        `;
      }).join("")}
    </div>
    <div class="ct-history">
      <div class="ct-history-viewport">
        <div class="ct-history-spacer" style="height: ${history.length * HISTORY_ROW_HEIGHT}px"></div>
        <div class="ct-history-items"></div>
      </div>
    </div>
    <button class="ct-button ct-secondary" data-action="close">Close</button>
  `;

  const viewport = sidebar.querySelector(".ct-history-viewport") as HTMLDivElement | null;
  if (viewport) {
    viewport.style.maxHeight = `${HISTORY_VIEWPORT_HEIGHT}px`;
    const render = () => renderHistoryItems(viewport, history);
    render();
    viewport.addEventListener("scroll", render, { passive: true });
  }

  const close = sidebar.querySelector("[data-action=close]") as HTMLButtonElement;
  if (close) {
    close.addEventListener("click", () => {
      sidebar.classList.remove("ct-visible");
      positionSidebar(sidebar);
    });
  }
}

function renderHistoryItems(viewport: HTMLDivElement, history: HistoryEntry[]) {
  const items = viewport.querySelector(".ct-history-items") as HTMLDivElement | null;
  if (!items) {
    return;
  }

  const scrollTop = viewport.scrollTop;
  const start = Math.max(0, Math.floor(scrollTop / HISTORY_ROW_HEIGHT) - 2);
  const visibleCount = Math.ceil(HISTORY_VIEWPORT_HEIGHT / HISTORY_ROW_HEIGHT) + 4;
  const end = Math.min(history.length, start + visibleCount);
  const slice = history.slice(start, end);

  items.style.transform = `translateY(${start * HISTORY_ROW_HEIGHT}px)`;
  items.innerHTML = slice.map((entry) => {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    const text = escapeHtml(entry.text).slice(0, 60);
    return `
      <div class="ct-history-row">
        <span class="ct-history-score">${entry.severity}/100</span>
        <span class="ct-history-text">${text}</span>
        <span class="ct-history-time">${time}</span>
      </div>
    `;
  }).join("");
}

function replaceInputValue(input: Element, value: string) {
  const emitInputEvents = (target: Element) => {
    try {
      target.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: value
      }));
    } catch {
      target.dispatchEvent(new Event("input", { bubbles: true }));
    }
    target.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const tryExecCommandInsert = (target: Element) => {
    try {
      if (target instanceof HTMLElement && target.isContentEditable) {
        const success = document.execCommand("selectAll", false);
        document.execCommand("insertText", false, value);
        return success;
      }
    } catch {
      return false;
    }
    return false;
  };

  const tryWhatsAppInsert = () => {
    if (window.location.host !== "web.whatsapp.com") {
      return false;
    }
    const editor = document.querySelector<HTMLElement>(
      'div[contenteditable="true"][role="textbox"]'
    );
    if (!editor) {
      return false;
    }
    editor.focus();
    const selection = window.getSelection();
    if (!selection) {
      return false;
    }
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    try {
      document.execCommand("insertText", false, value);
      emitInputEvents(editor);
      return true;
    } catch {
      return false;
    }
  };

  const active = document.activeElement;
  const target = (active && active !== document.body
    && (active instanceof HTMLInputElement
      || active instanceof HTMLTextAreaElement
      || (active instanceof HTMLElement && active.isContentEditable)))
    ? active
    : input;

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    target.focus();
    target.value = value;
    target.setSelectionRange(value.length, value.length);
    emitInputEvents(target);
    return;
  }

  if (target instanceof HTMLElement) {
    target.focus();
    if (tryExecCommandInsert(target)) {
      emitInputEvents(target);
      return;
    }
    if (tryWhatsAppInsert()) {
      return;
    }

    target.textContent = value;
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    emitInputEvents(target);
  }
}

function positionBadge(
  badge: HTMLButtonElement,
  rect: DOMRect,
  placement: BadgePlacement
) {
  const offset = 10;
  const width = badge.offsetWidth || 60;
  const height = badge.offsetHeight || 26;

  let top = rect.top;
  let left = rect.right + offset;

  if (placement === "above") {
    top = rect.top - height - offset;
    left = rect.left + rect.width - width;
  } else if (placement === "below") {
    top = rect.bottom + offset;
    left = rect.left + rect.width - width;
  } else if (placement === "left") {
    top = rect.bottom - height;
    left = rect.left - width - offset;
  }

  badge.style.top = `${Math.max(8, top)}px`;
  badge.style.left = `${Math.max(8, left)}px`;
}

function positionPopup(
  popup: HTMLDivElement,
  rect: DOMRect,
  placement: BadgePlacement
) {
  const offset = 14;
  const width = popup.offsetWidth || 320;
  const height = popup.offsetHeight || 220;

  let top = rect.top - 10;
  let left = rect.right - width;

  if (placement === "above") {
    top = rect.top - popup.offsetHeight - offset;
    left = rect.left;
  } else if (placement === "below") {
    top = rect.bottom + offset;
    left = rect.left;
  } else if (placement === "left") {
    top = rect.bottom - popup.offsetHeight;
    left = rect.left - width - offset;
  }

  const maxTop = Math.max(8, window.innerHeight - height - 8);
  const maxLeft = Math.max(8, window.innerWidth - width - 8);
  popup.style.top = `${Math.min(Math.max(8, top), maxTop)}px`;
  popup.style.left = `${Math.min(Math.max(8, left), maxLeft)}px`;
}

function positionSidebar(sidebar: HTMLDivElement) {
  sidebar.style.transform = sidebar.classList.contains("ct-visible")
    ? "translateX(0%)"
    : "translateX(100%)";
}

function getSeverityLabel(severity: number) {
  if (severity >= 70) {
    return "High conflict";
  }

  if (severity >= 40) {
    return "Moderate conflict";
  }

  return "Low conflict";
}

function guessEmotion(severity: number) {
  if (severity >= 70) {
    return "Frustration";
  }
  if (severity >= 40) {
    return "Concern";
  }
  return "Neutral";
}

function guessNeed(severity: number) {
  if (severity >= 70) {
    return "Respect";
  }
  if (severity >= 40) {
    return "Clarity";
  }
  return "Understanding";
}

type Alternatives = {
  empathic: string;
  rational: string;
  socratic: string;
};

function generateAlternatives(text: string): Alternatives {
  const normalized = normalizeText(text);
  const base = normalized || "I want to talk this through.";

  return {
    empathic: `I feel frustrated. Can we talk about what is not working?`,
    rational: `I noticed an issue. Lets discuss specifics and solutions.`,
    socratic: `What part of this is most difficult for you?`
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncateText(value: string, limit: number) {
  const normalized = value.trim();
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, limit - 1))}…`;
}
