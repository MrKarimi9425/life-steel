import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Life Steel", template: "%s | Life Steel" },
  description: "تولید کننده حوله خشک کن و رادیاتور استیل",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
