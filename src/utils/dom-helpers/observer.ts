type WaitOptions = {
  root?: ParentNode;
  timeoutMs?: number;
};

export function debounce<T extends (...args: never[]) => void>(
  callback: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timerId: number | undefined;

  return (...args: Parameters<T>) => {
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
    }

    timerId = window.setTimeout(() => callback(...args), delayMs);
  };
}

export function waitForElement(
  selector: string,
  options: WaitOptions = {}
): Promise<Element> {
  const root = options.root ?? document;
  const timeoutMs = options.timeoutMs ?? 15000;
  const existing = root.querySelector(selector);

  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const match = root.querySelector(selector);
      if (match) {
        observer.disconnect();
        resolve(match);
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    window.setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timed out waiting for ${selector}`));
    }, timeoutMs);
  });
}
