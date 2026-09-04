import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./bd.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bd",
});

export const metadata: Metadata = {
  title: "BD Meeting Dashboard — Upstream Europe",
  description: "Real-time business development meeting dashboard for O&G Upstream in Europe.",
};

export default function BDLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${plex.variable} font-bd antialiased`}>{children}</div>
  );
}
