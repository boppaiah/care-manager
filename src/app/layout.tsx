import type { Metadata } from "next";
import "./globals.css";
import { DemoProvider } from "@/components/demo-provider";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: {
    default: "Care Manager Copilot",
    template: "%s · Care Manager Copilot",
  },
  description:
    "A synthetic-data workspace for care managers to prepare conversations and follow through.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <body>
        <DemoProvider>
          <Shell>{children}</Shell>
        </DemoProvider>
      </body>
    </html>
  );
}
