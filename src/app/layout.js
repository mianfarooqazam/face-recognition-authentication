import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Face Recognition Login",
  description: "Secure authentication with AI-powered face recognition",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientLayout className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}