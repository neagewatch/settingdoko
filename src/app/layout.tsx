import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://settingdoko.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '設定どこ？ | PC・スマホ・業務アプリの設定ナビ',
    template: '%s | 設定どこ？',
  },
  description: '「設定の場所がわからない」を最速で解決。Windows 11・iPhone・macOS・Android、Outlook・Teams・Excelなど業務アプリの設定場所と手順を検索できます。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: '設定どこ？',
    title: '設定どこ？ | PC・スマホ・業務アプリの設定ナビ',
    description: '「設定の場所がわからない」を最速で解決。設定場所と手順を検索できます。',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="skip-link">本文へスキップ</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
