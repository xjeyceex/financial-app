export const formatCurrency = (
  amount: number,
  currency: string = 'PHP',
  locale: string = 'en-PH'
) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
