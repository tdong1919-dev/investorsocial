import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Investor Social - Operating Network',
  description: 'A role-aware Investor Social demo for investor readiness, agent routing, deal workspaces, REIDE analysis, and controlled introductions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
