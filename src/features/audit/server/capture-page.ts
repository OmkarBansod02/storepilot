import { chromium, errors, type Browser } from "playwright";

import type { PageSignals } from "@/features/audit/schemas/audit-result";
import { AuditError } from "@/features/audit/lib/audit-errors";
import { extractPageSignals } from "@/features/audit/lib/extract-page-signals";
import { validatePublicAuditUrl } from "@/features/audit/lib/public-url";

const AUDIT_NAVIGATION_TIMEOUT_MS = 20_000;
const AUDIT_IDLE_TIMEOUT_MS = 5_000;

export interface CapturedPage {
  finalUrl: string;
  screenshotUrl: string;
  signals: PageSignals;
}

export async function capturePageForAudit(url: string): Promise<CapturedPage> {
  let browser: Browser | null = null;

  try {
    const safeUrl = await validatePublicAuditUrl(url);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1200 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 LiftpilotAudit/1.0",
    });

    const response = await page.goto(safeUrl, {
      waitUntil: "domcontentloaded",
      timeout: AUDIT_NAVIGATION_TIMEOUT_MS,
    });

    if (!response) {
      throw new AuditError(
        "unreachable_page",
        "The page did not return a usable response.",
      );
    }

    if (response.status() >= 400) {
      throw new AuditError(
        "unreachable_page",
        `The page returned HTTP ${response.status()}.`,
      );
    }

    await validatePublicAuditUrl(page.url());

    try {
      await page.waitForLoadState("networkidle", {
        timeout: AUDIT_IDLE_TIMEOUT_MS,
      });
    } catch {
      // Network idle is helpful but not required; many landing pages keep analytics connections open.
    }

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
      timeout: AUDIT_NAVIGATION_TIMEOUT_MS,
    });
    const signals = await extractPageSignals(page);

    return {
      finalUrl: page.url(),
      screenshotUrl: `data:image/png;base64,${screenshot.toString("base64")}`,
      signals,
    };
  } catch (error) {
    if (error instanceof AuditError) {
      throw error;
    }

    if (error instanceof errors.TimeoutError) {
      throw new AuditError("timeout", "The page took too long to load.", error);
    }

    throw new AuditError(
      "extraction_failed",
      "The audit browser could not render the page.",
      error,
    );
  } finally {
    await browser?.close();
  }
}
