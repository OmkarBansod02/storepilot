import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acme Launch — Ship faster. Convert better.",
  description:
    "The launch platform that grows with your product. Built-in analytics, A/B testing, and smart defaults.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
