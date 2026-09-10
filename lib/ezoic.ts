export function runEzoic(callback: () => void) {
  if (typeof window === "undefined") return;

  window.ezstandalone = window.ezstandalone || {};
  window.ezstandalone.cmd = window.ezstandalone.cmd || [];
  window.ezstandalone.cmd.push(callback);
}
