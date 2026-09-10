export function runEzoic(callback: () => void) {
  if (typeof window === "undefined") return;

  const ezstandalone = (window.ezstandalone ??= {
    cmd: [],
    showAds: () => undefined
  });

  ezstandalone.cmd ??= [];
  ezstandalone.cmd.push(callback);
}
