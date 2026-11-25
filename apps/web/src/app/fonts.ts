import localFont from 'next/font/local';

/** Self-hosted typefaces (see src/fonts/LICENSE.md). */
export const body = localFont({
  src: [
    {
      path: '../fonts/atkinson-hyperlegible-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/atkinson-hyperlegible-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
});

export const display = localFont({
  src: '../fonts/bricolage-grotesque-latin-wght-normal.woff2',
  weight: '200 800',
  variable: '--font-display-face',
  display: 'swap',
});

export const mono = localFont({
  src: '../fonts/jetbrains-mono-latin-400-normal.woff2',
  weight: '400',
  variable: '--font-mono-face',
  display: 'swap',
});
