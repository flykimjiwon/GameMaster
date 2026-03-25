import Decimal from 'break_infinity.js';

export { Decimal };

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function formatDecimal(value: Decimal): string {
  const num = value.toNumber();
  if (num < 1000) {
    return Math.floor(num).toString();
  }
  const log = Math.floor(Math.log10(num) / 3);
  const idx = Math.min(log, SUFFIXES.length - 1);
  const divisor = new Decimal(Math.pow(1000, idx));
  const shortened = value.div(divisor).toNumber();
  return shortened.toFixed(2).replace(/\.?0+$/, '') + SUFFIXES[idx];
}

export function formatNumber(n: number): string {
  return formatDecimal(new Decimal(n));
}

export function decimalFromNumber(n: number): Decimal {
  return new Decimal(n);
}

export function decimalMax(a: Decimal, b: Decimal): Decimal {
  return a.gt(b) ? a : b;
}

export function decimalMin(a: Decimal, b: Decimal): Decimal {
  return a.lt(b) ? a : b;
}
