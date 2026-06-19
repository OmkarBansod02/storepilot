import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atelier Craft - Premium Full-Grain Leather Wallet",
  description:
    "Handmade in small batches from ethically sourced full-grain leather. Designed to age beautifully and last a lifetime.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
