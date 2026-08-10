import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import MobileCartBar from "@/components/MobileCartBar";

export const metadata: Metadata = {
  title: "Sharma Ji Chaat & Golgappe Bhandar | Order Fresh Street Food Online",
  description: "Order authentic crispy Golgappe (Pani Puri), Aloo Tikki, Papdi Chaat, Dahi Bhalla & Combos online. Made with 100% RO filtered water and pure ingredients. Fast local delivery & Cash on Delivery available.",
  keywords: [
    "Golgappe online order",
    "Pani Puri delivery",
    "Chaat shop nearby",
    "Aloo Tikki Chaat",
    "Papdi Chaat",
    "Dahi Bhalla",
    "Street food delivery",
    "Sharma Ji Chaat"
  ],
  openGraph: {
    title: "Sharma Ji Chaat & Golgappe Bhandar",
    description: "Crispy Golgappe & Authentic Indian Street Chaats delivered fresh to your door with RO water hygiene promise.",
    type: "website",
    locale: "en_IN",
    siteName: "Sharma Ji Chaat & Golgappe"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-stone-50 text-stone-900 antialiased selection:bg-orange-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <FloatingWhatsApp />
            <MobileCartBar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
