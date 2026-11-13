import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BitAgent | Autonomous AI Agent Treasury & Session Keys on Bitcoin L2",
  description: "Budget-controlled smart accounts with cryptographic session keys for autonomous AI agents on Bitcoin's economic layer.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#07080E] text-slate-100 font-sans selection:bg-mezo/30 selection:text-orange-200 min-h-screen">
        {children}
      </body>
    </html>
  );
}
