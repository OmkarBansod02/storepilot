import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Northstar Pack - Carry less. Move faster.",
  description:
    "A compact, weather-ready daypack for commutes, weekend trips, and fast-moving city escapes.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
