function digitsOnly(value: string) {
  return value.replace(/[^0-9]/g, '');
}

export function formatBudgetInput(value: string | number, locale = 'en-US') {
  const digits = digitsOnly(String(value ?? ''));
  if (!digits) return '';
  const amount = Number(digits);
  if (!Number.isFinite(amount)) return '';
  return new Intl.NumberFormat(locale).format(amount);
}

export function parseBudgetInput(value: string) {
  const digits = digitsOnly(String(value ?? ''));
  if (!digits) return 0;
  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : 0;
}
