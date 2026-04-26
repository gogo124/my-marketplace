"use client";

import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

type TrackedExternalLinkProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    eventName: string;
    eventData?: Record<string, string | number | boolean | null | undefined>;
  }
>;

export function TrackedExternalLink({
  eventName,
  eventData = {},
  onClick,
  children,
  ...props
}: TrackedExternalLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackAnalyticsEvent(eventName, eventData);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

