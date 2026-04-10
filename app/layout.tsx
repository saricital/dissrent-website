import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";

const headingFont = Oswald({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DISS RENT - Premium Car Rental",
  description: "DISS RENT - rent a car u Banjaluci bez depozita i skrivenih troskova.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={headingFont.variable}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
