import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Document Studio',
  description: 'Upload, extract, edit, and export professional documents.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
