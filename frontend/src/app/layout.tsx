import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RepoRescue AI | GitHub Repository Understanding & Change Impact Analysis',
  description: 'AI-Powered developer tool that analyzes codebase architecture, workflow, code health, and blast-radius change impact before you modify code.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0F19] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
