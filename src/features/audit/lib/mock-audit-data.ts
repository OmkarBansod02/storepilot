export const AUDIT_LOADING_STEPS = [
  { label: "Connecting to page", duration: 1200 },
  { label: "Capturing screenshot", duration: 1800 },
  { label: "Extracting page signals", duration: 2000 },
  { label: "Analyzing conversion patterns", duration: 2200 },
  { label: "Generating audit report", duration: 1500 },
] as const;
