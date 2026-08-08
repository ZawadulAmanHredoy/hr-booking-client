import type { Currency } from './constants'

const currencyLocales: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  BDT: 'bn-BD',
  INR: 'en-IN',
  CAD: 'en-CA',
  AUD: 'en-AU',
}

export function formatMoney(cents: number, currency: Currency): string {
  return new Intl.NumberFormat(currencyLocales[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatRate(cents: number, currency: Currency): string {
  return `${formatMoney(cents, currency)}/hr`
}
