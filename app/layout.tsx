import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import "./globals.css";
import {ContextProvider} from "@/components/ContextProvider";
import { QueryProviders } from "@/providers/query-provider";
import { SheetProvider } from "@/providers/sheet-provider";
import { cn } from "@/lib/utils";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <ContextProvider>
      <html lang="en">
        <body className={cn("",inter.className)}>
          <QueryProviders>
            <SheetProvider />
            <Toaster/>
            {children}
          </QueryProviders>
         </body>
      </html>
</ContextProvider>
  );
}

