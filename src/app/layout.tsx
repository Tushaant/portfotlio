import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const orbitron = Orbitron({
 variable: "--font-orbitron",
 subsets: ["latin"],
 weight: ["400", "500", "600", "700", "800"],
});

const space = Space_Grotesk({
 variable: "--font-space",
 subsets: ["latin"],
 weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
 variable: "--font-jetbrains",
 subsets: ["latin"],
 weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
 title: {
 default: "Tushant Sharma · AI Product Command Center",
 template: "%s · Tushant.AI PRODUCT OS",
 },
 description:
 "Immersive AI Product Manager portfolio - Agentic AI, LLMs, Enterprise AI. Mission control for products built by Tushant Sharma.",
 keywords: [
 "AI Product Manager",
 "Agentic AI",
 "Director of Product Management",
 "Tushant Sharma",
 "Enterprise AI",
 "RAG",
 "LLM",
 ],
 authors: [{ name: "Tushant Sharma" }],
 openGraph: {
 title: "Tushant Sharma · AI Product Command Center",
 description:
 "Futuristic command center portfolio for an AI Product Manager / Acting Director of Product Management.",
 type: "website",
 },
 metadataBase: new URL("https://tushant-ai-os.vercel.app"),
};

export const viewport: Viewport = {
 themeColor: "#000000",
 colorScheme: "dark",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" className="dark">
 <body
 className={`${orbitron.variable} ${space.variable} ${jetbrains.variable} antialiased`}
 >
 <Providers>{children}</Providers>
 </body>
 </html>
 );
}
