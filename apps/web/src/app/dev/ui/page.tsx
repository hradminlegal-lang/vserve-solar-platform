import { notFound } from 'next/navigation';
import { Gallery } from './gallery';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Component gallery', robots: { index: false } };

/** Every component in every state. Hidden in production unless ENABLE_DEV_UI=1 (used by Playwright). */
export default function DevUiPage() {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEV_UI !== '1') notFound();
  return <Gallery />;
}
