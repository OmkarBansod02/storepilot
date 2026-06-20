import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atelier Craft — Premium Full-Grain Leather Wallet",
  description:
    "Hand-cut and saddle-stitched from vegetable-tanned full-grain leather. Small-batch atelier craftsmanship that ages beautifully.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
