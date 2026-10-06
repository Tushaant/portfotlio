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
 default: "Tushant Sharma | AI Product Leader",
 template: "%s · Tushant Sharma",
 },
 description:
 "AI Product Leader with 10+ years of experience building enterprise AI, Agentic AI, SaaS and data-driven products from 0 to 1 and 1 to N.",
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
 title: "Tushant Sharma | AI Product Leader",
 description:
 "AI Product Leader with 10+ years of experience building enterprise AI, Agentic AI, SaaS and data-driven products from 0 to 1 and 1 to N.",
 type: "website",
 },
 metadataBase: new URL("https://tushant-ai-os.vercel.app"),
};

export const viewport: Viewport = {
 themeColor: "#050505",
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
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify({
 "@context": "https://schema.org",
 "@type": "Person",
 name: "Tushant Sharma",
 jobTitle: "AI Product Manager and Acting Director of Product Management",
 url: "https://portfotlio-zeta.vercel.app/",
 address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN" },
 }),
 }}
 />
 </body>
 </html>
 );
}
