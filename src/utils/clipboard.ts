/**
 * Robust copy logic that supports browser page environment as well as iframe sandboxes
 */
export function fallbackCopyToClipboard(text: string): boolean {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Avoid page jumps on focus
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy operation failed: ', err);
    return false;
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn("navigator.clipboard.writeText failed, using fallback copy option", e);
      return fallbackCopyToClipboard(text);
    }
  } else {
    return fallbackCopyToClipboard(text);
  }
}
