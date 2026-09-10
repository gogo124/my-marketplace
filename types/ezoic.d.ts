type EzoicShowAdsOptions = {
  anchor?: string;
  location?: string;
};

declare global {
  interface Window {
    ezstandalone?: {
      cmd: Array<() => void>;
      showAds: (options?: EzoicShowAdsOptions) => void;
      destroyPlaceholders?: (...ids: number[]) => void;
      destroyAll?: () => void;
    };
  }
}

export {};
