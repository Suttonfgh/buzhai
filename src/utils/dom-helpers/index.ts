export function isEditableElement(element: Element | null): boolean {
  if (!element) {
    return false;
  }

  const tagName = element.tagName.toLowerCase();
  if (tagName === "textarea" || tagName === "input") {
    return true;
  }

  return (element as HTMLElement).isContentEditable;
}

export { debounce, waitForElement } from "./observer";
