import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transport Management',
  description: 'A transport management application',
};

import { getSession } from "@/lib/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
