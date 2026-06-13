"use client";
import { useEffect, useRef } from "react";
function record(productId: string, event: "view" | "click") { void fetch(`/api/affiliate-products/${productId}/analytics`, { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ event }) }).catch(() => undefined); }
export function ProductViewTracker({ productId }: { productId: string }) { const tracked = useRef(false); useEffect(() => { if (!tracked.current) { tracked.current = true; record(productId, "view"); } }, [productId]); return null; }
export function ProductBuyLink({ productId, href, children, className }: { productId: string; href: string; children: React.ReactNode; className?: string }) { return <a href={href} target="_blank" rel="noopener noreferrer sponsored" onClick={() => record(productId, "click")} className={className}>{children}</a>; }
