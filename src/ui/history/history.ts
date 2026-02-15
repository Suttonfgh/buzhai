import { clearHistory, getHistory } from "../../utils/storage";

const table = document.querySelector("#history-table");
const empty = document.querySelector("#empty");
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh");
const exportButton = document.querySelector<HTMLButtonElement>("#export");
const clearButton = document.querySelector<HTMLButtonElement>("#clear");

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

async function render() {
  const history = await getHistory();
  const rows = history.slice().reverse();

  if (!table) {
    return;
  }

  table.querySelectorAll(".row.data").forEach((row) => row.remove());

  if (rows.length === 0) {
    if (empty) {
      empty.removeAttribute("hidden");
    }
    return;
  }

  if (empty) {
    empty.setAttribute("hidden", "true");
  }

  rows.forEach((entry) => {
    const scoreClass = entry.severity >= 70
      ? "high"
      : entry.severity >= 40
        ? "mid"
        : "";
    const row = document.createElement("div");
    row.className = "row data";
    row.innerHTML = `
      <div><span class="score-chip ${scoreClass}">${entry.severity}/100</span></div>
      <div class="message-cell" title="${escapeHtml(entry.text)}">${escapeHtml(entry.text)}</div>
      <div>${entry.emotions.join(", ") || "-"}</div>
      <div>${entry.needs.join(", ") || "-"}</div>
      <div>${formatTime(entry.timestamp)}</div>
    `;
    table.appendChild(row);
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

refreshButton?.addEventListener("click", () => void render());

exportButton?.addEventListener("click", async () => {
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

clearButton?.addEventListener("click", async () => {
  await clearHistory();
  void render();
});

void render();
