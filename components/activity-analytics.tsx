"use client";

import { useEffect, useRef } from "react";

function record(activityId: string, event: "view" | "book_click") {
  void fetch(`/api/activities/${activityId}/analytics`, { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ event }) }).catch(() => undefined);
}

export function ActivityViewTracker({ activityId }: { activityId: string }) {
  const tracked = useRef(false);
  useEffect(() => { if (!tracked.current) { tracked.current = true; record(activityId, "view"); } }, [activityId]);
  return null;
}

export function ActivityBookLink({ activityId, href, children, className }: { activityId: string; href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="sponsored noopener noreferrer" onClick={() => record(activityId, "book_click")} className={className}>{children}</a>;
}
