declare global {
  interface Window {
    ezstandalone?: {
      cmd: Array<() => void>;
      showAds: (...args: any[]) => void;
      destroyPlaceholders?: (...ids: number[]) => void;
    };
  }
}

export {};
