const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});
const pesoCents = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
});

/** Formats integer centavos as pesos, e.g. 1234500 → "₱12,345". Stored money is always centavos. */
export function formatCentavos(centavos: number | bigint, withCents = false): string {
  const pesos = Number(centavos) / 100;
  return (withCents ? pesoCents : peso).format(pesos);
}

/** Formats a peso amount that came from a calculator (a plain number, not stored money). */
export function formatPhp(pesos: number): string {
  return peso.format(Math.round(pesos));
}

/** Formats a number with thousands separators and a fixed number of decimals. */
export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
