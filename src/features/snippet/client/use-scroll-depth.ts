"use client";

import { useEffect, useRef } from "react";
import { useTracker } from "./tracker-provider";

const MILESTONES = [25, 50, 75, 100] as const;

export function useScrollDepth() {
  const { track, ready } = useTracker();
  const reached = useRef(new Set<number>());

  useEffect(() => {
    if (!ready) return;

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.round((scrollTop / docHeight) * 100);

      for (const milestone of MILESTONES) {
        if (percent >= milestone && !reached.current.has(milestone)) {
          reached.current.add(milestone);
          track("scroll_depth", { depth: milestone });
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ready, track]);
}
