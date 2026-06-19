"use client";

import { useEffect, useRef } from "react";
import { useTracker } from "./tracker-provider";

export function usePageView() {
  const { track, ready } = useTracker();
  const fired = useRef(false);

  useEffect(() => {
    if (!ready || fired.current) return;
    fired.current = true;
    track("page_view", {
      path: window.location.pathname,
      title: document.title,
    });
  }, [ready, track]);
}
