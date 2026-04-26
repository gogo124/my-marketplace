"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function ConversationReadMarker({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const markedRef = useRef(false);

  useEffect(() => {
    if (!conversationId || markedRef.current) {
      return;
    }

    markedRef.current = true;
    const controller = new AbortController();
    let active = true;

    void fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal
    })
      .then((response) => {
        if (active && response.ok) {
          router.refresh();
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
      controller.abort();
    };
  }, [conversationId, router]);

  return null;
}
