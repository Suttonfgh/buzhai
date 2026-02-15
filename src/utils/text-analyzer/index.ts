export type DetectedLanguage = "ru" | "en" | "mixed" | "unknown";

export type TextMetadata = {
  capsRatio: number;
  punctuationCount: number;
  length: number;
};

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;

export function normalizeText(text: string): string {
  return text.replace(ZERO_WIDTH, "").replace(/\s+/g, " ").trim();
}

export function detectLanguage(text: string): DetectedLanguage {
  const normalized = normalizeText(text);
  if (!normalized) {
    return "unknown";
  }

  const cyrillic = normalized.match(/[\u0400-\u04FF]/g)?.length ?? 0;
  const latin = normalized.match(/[A-Za-z]/g)?.length ?? 0;

  if (cyrillic > 0 && latin > 0) {
    return "mixed";
  }

  if (cyrillic > 0) {
    return "ru";
  }

  if (latin > 0) {
    return "en";
  }

  return "unknown";
}

export function extractMessageText(element: Element): string {
  const parts: string[] = [];

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  let node = walker.currentNode;
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.textContent ?? "");
    } else if (node instanceof HTMLElement) {
      const tag = node.tagName.toLowerCase();
      if (tag === "br") {
        parts.push("\n");
      }

      if (tag === "img") {
        parts.push(node.getAttribute("alt") ?? "");
      }

      if (tag === "a") {
        const linkText = node.textContent ?? node.getAttribute("href") ?? "";
        parts.push(linkText);
      }
    }

    node = walker.nextNode();
  }

  return normalizeText(parts.join(" "));
}

export function getTextMetadata(text: string): TextMetadata {
  const normalized = normalizeText(text);
  const letters = normalized.match(/[A-Za-z\u0400-\u04FF]/g)?.length ?? 0;
  const caps = normalized.match(/[A-Z\u0410-\u042F]/g)?.length ?? 0;
  const punctuationCount =
    normalized.match(/[.!?…,:;]/g)?.length ?? 0;
  const capsRatio = letters === 0 ? 0 : caps / letters;

  return {
    capsRatio,
    punctuationCount,
    length: normalized.length
  };
}
