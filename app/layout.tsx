import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import "./globals.css";
import { ContextProvider } from "@/components/context-provider";
import { QueryProviders } from "@/providers/query-provider";
import { SheetProvider } from "@/providers/sheet-provider";
import {
  Poiret_One,
  Roboto,
  Nunito,
  Teko,
  Oxygen,
  Yeseva_One,
  Caveat,
} from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

const poiretOne = Poiret_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poiret-one",
});

const caveat = Caveat({
  weight: ["400", "500", "600", "700"], // All weights
  subsets: ["latin", "latin-ext"],
  variable: "--font-caveat",
});

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const teko = Teko({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-teko",
});

const oxygen = Oxygen({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-oxygen",
});

const yesevaOne = Yeseva_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-yeseva-one",
});

export const metadata: Metadata = {
  title: "Fimae - Sop Manuel",
  description: "Your personal AI finance assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ContextProvider>
      <html lang="en">
        <body
          className={cn(
            "",
            inter.className,
            yesevaOne.variable,
            roboto.variable,
            oxygen.variable,
            teko.variable,
            nunito.variable,
            roboto.variable,
            poiretOne.variable,
            caveat.variable,
          )}
        >
          <QueryProviders>
            <SheetProvider />
            <Toaster />
            {children}
          </QueryProviders>
        </body>
      </html>
    </ContextProvider>
  );
}
