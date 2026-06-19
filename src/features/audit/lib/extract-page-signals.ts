import type { Page } from "playwright";

import {
  pageSignalsSchema,
  type PageSignals,
} from "@/features/audit/schemas/audit-result";

import { AuditError } from "./audit-errors";

interface ExtractedDomSignals {
  pageTitle: string;
  metaDescription: string | null;
  ogImage: string | null;
  mainHeading: string | null;
  subheadings: string[];
  ctaLabels: string[];
  hasForm: boolean;
  formFieldCount: number;
  navLinkCount: number;
  trustSignals: string[];
  sectionSignals: string[];
  aboveTheFold: {
    textLength: number;
    linkCount: number;
    buttonCount: number;
    formFieldCount: number;
  };
}

export async function extractPageSignals(page: Page): Promise<PageSignals> {
  let domSignals: ExtractedDomSignals;

  try {
    domSignals = await page.evaluate(() => {
      const visibleText = (value: string | null | undefined): string =>
        (value ?? "").replace(/\s+/g, " ").trim();

      const readAttribute = (selector: string, attribute: string): string | null => {
        const value = document.querySelector(selector)?.getAttribute(attribute);
        const cleaned = visibleText(value);

        return cleaned || null;
      };

      const isVisible = (element: Element): boolean => {
        const box = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
          box.width > 0 &&
          box.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none"
        );
      };

      const unique = (values: string[], limit: number): string[] => {
        const seen = new Set<string>();
        const output: string[] = [];

        for (const value of values) {
          const cleaned = visibleText(value);
          const key = cleaned.toLowerCase();

          if (!cleaned || seen.has(key)) {
            continue;
          }

          seen.add(key);
          output.push(cleaned);

          if (output.length >= limit) {
            break;
          }
        }

        return output;
      };

      const bodyText = visibleText(document.body?.innerText ?? "");
      const lowerBodyText = bodyText.toLowerCase();
      const pageTitle = visibleText(document.title);
      const metaDescription = readAttribute("meta[name='description']", "content");
      const ogImage = readAttribute("meta[property='og:image']", "content");
      const mainHeading = visibleText(document.querySelector("h1")?.textContent);
      const subheadings = unique(
        Array.from(document.querySelectorAll("h2, h3"))
          .filter(isVisible)
          .map((element) => element.textContent ?? ""),
        8,
      );

      const ctaCandidates = Array.from(
        document.querySelectorAll(
          "button, a[href], [role='button'], input[type='submit'], input[type='button']",
        ),
      ).filter(isVisible);

      const ctaKeywords = [
        "start",
        "try",
        "get",
        "book",
        "demo",
        "buy",
        "shop",
        "signup",
        "sign up",
        "subscribe",
        "contact",
        "join",
        "download",
        "request",
        "learn more",
      ];

      const ctaLabels = unique(
        ctaCandidates
          .map((element) => {
            if (element instanceof HTMLInputElement) {
              return element.value || element.ariaLabel || element.title;
            }

            return element.textContent || element.getAttribute("aria-label") || element.getAttribute("title");
          })
          .filter((label): label is string => {
            const cleaned = visibleText(label);
            const lower = cleaned.toLowerCase();

            return cleaned.length > 0 && ctaKeywords.some((keyword) => lower.includes(keyword));
          }),
        12,
      );

      const formFields = Array.from(
        document.querySelectorAll("input:not([type='hidden']), textarea, select"),
      ).filter(isVisible);

      const navLinks = new Set<Element>();

      for (const link of document.querySelectorAll("nav a[href], [role='navigation'] a[href]")) {
        if (isVisible(link)) {
          navLinks.add(link);
        }
      }

      if (navLinks.size === 0) {
        for (const link of document.querySelectorAll("header a[href]")) {
          if (isVisible(link)) {
            navLinks.add(link);
          }
        }
      }

      const trustSignals: string[] = [];

      if (/\btrusted by\b|\bcustomers?\b|\busers?\b|\bteams?\b/.test(lowerBodyText)) {
        trustSignals.push("Mentions customer or user proof");
      }

      if (/\breviews?\b|\brated\b|\bstars?\b|★/.test(lowerBodyText)) {
        trustSignals.push("Mentions ratings or reviews");
      }

      if (/\bsecure\b|\bsoc 2\b|\bgdpr\b|\bhipaa\b|\bencrypted\b/.test(lowerBodyText)) {
        trustSignals.push("Mentions security or compliance");
      }

      if (/\bguarantee\b|\brefund\b|\bwarranty\b|\brisk-free\b/.test(lowerBodyText)) {
        trustSignals.push("Mentions guarantee or risk reversal");
      }

      if (/\btestimonial\b|\bcase stud/.test(lowerBodyText)) {
        trustSignals.push("Mentions testimonials or case studies");
      }

      if (/\d[\d,.]*\+?\s*(customers|users|teams|companies|reviews)/i.test(bodyText)) {
        trustSignals.push("Includes quantified social proof");
      }

      const sectionHints = [
        ["Hero", "hero"],
        ["Features", "feature"],
        ["Benefits", "benefit"],
        ["Pricing", "pricing"],
        ["Testimonials", "testimonial"],
        ["FAQ", "faq"],
        ["Integrations", "integration"],
        ["Footer", "footer"],
      ] as const;

      const sectionSignals = unique(
        sectionHints
          .filter(([, keyword]) => lowerBodyText.includes(keyword))
          .map(([label]) => label),
        8,
      );

      const aboveFoldElements = Array.from(document.body.querySelectorAll("body *")).filter(
        (element) => {
          const box = element.getBoundingClientRect();

          return isVisible(element) && box.top >= 0 && box.top < window.innerHeight;
        },
      );

      const aboveFoldText = unique(
        aboveFoldElements.map((element) => element.textContent ?? ""),
        80,
      ).join(" ");

      return {
        pageTitle,
        metaDescription,
        ogImage,
        mainHeading: mainHeading || null,
        subheadings,
        ctaLabels,
        hasForm: document.querySelectorAll("form").length > 0 || formFields.length > 0,
        formFieldCount: formFields.length,
        navLinkCount: navLinks.size,
        trustSignals: unique(trustSignals, 8),
        sectionSignals,
        aboveTheFold: {
          textLength: aboveFoldText.length,
          linkCount: aboveFoldElements.filter((element) => element.matches("a[href]")).length,
          buttonCount: aboveFoldElements.filter((element) =>
            element.matches("button, [role='button'], input[type='submit'], input[type='button']"),
          ).length,
          formFieldCount: aboveFoldElements.filter((element) =>
            element.matches("input:not([type='hidden']), textarea, select"),
          ).length,
        },
      };
    });
  } catch (error) {
    throw new AuditError(
      "extraction_failed",
      "Page signals could not be extracted.",
      error,
    );
  }

  const parsed = pageSignalsSchema.safeParse({
    finalUrl: page.url(),
    ...domSignals,
  });

  if (!parsed.success) {
    throw new AuditError(
      "extraction_failed",
      "Extracted page signals were not valid.",
      parsed.error,
    );
  }

  return parsed.data;
}
