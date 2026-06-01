import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'REIM EVENTOS',
  description: 'Todos os fornecedores do seu evento em um só lugar',
  manifest: '/manifest.json',
  themeColor: '#0B0B0F'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
