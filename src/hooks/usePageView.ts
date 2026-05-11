import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { trpc } from "@/providers/trpc";

export function usePageView() {
  const location = useLocation();
  const trackedRef = useRef<string>("");
  const track = trpc.analytics.track.useMutation();

  useEffect(() => {
    const path = location.pathname + location.search;
    if (trackedRef.current === path) return;
    trackedRef.current = path;

    const timer = setTimeout(() => {
      track.mutate({
        path,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent?.slice(0, 255) || undefined,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);
}
