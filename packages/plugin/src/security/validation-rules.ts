// ============================================
// VALIDATION RULES - Payment Validation
// ============================================
//
// Validation rules for MercadoPago payment operations.
//
// SECURITY: These are basic validations. Add more strict
// validation rules based on your business requirements.

// Supported currency codes by MercadoPago
const SUPPORTED_CURRENCIES = [
  "ARS",
  "BRL",
  "CLP",
  "COP",
  "MXN",
  "PEN",
  "UYU",
  "USD",
] as const;

// Minimum and maximum payment amounts (in cents)
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 100_000_000;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Validate currency code
 */
export function validateCurrency(currency: string): boolean {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency);
}

/**
 * Validate payment amount (in cents)
 */
export function validateAmount(amount: number): boolean {
  return amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
}

/**
 * Validate total payment amount
 */
export function validateTotalAmount(amount: number): boolean {
  return validateAmount(amount);
}

/**
 * Compare expected amount with actual payment amount
 * Allows for small differences due to rounding
 */
export function validatePaymentAmount(
  expectedAmount: number,
  actualAmount: number
): boolean {
  // Allow 1% difference for rounding
  const tolerance = expectedAmount * 0.01;
  return Math.abs(expectedAmount - actualAmount) <= tolerance;
}

// ============================================
// EXPORT DEFAULT OBJECT (like the example)
// ============================================

export const ValidationRules = {
  amount: validateAmount,
  currency: validateCurrency,
  totalAmount: validateTotalAmount,
  validatePaymentAmount,
};

// ============================================
// ADDITIONAL HELPERS
// ============================================

/**
 * Get supported currencies
 */
export function getSupportedCurrencies(): readonly string[] {
  return SUPPORTED_CURRENCIES;
}

/**
 * Format amount from cents to display
 */
export function formatAmount(amount: number, currency: string): string {
  const value = amount / 100;
  return new Intl.NumberFormat("es-AR", {
    currency,
    style: "currency",
  }).format(value);
}

/**
 * Parse amount from display to cents
 */
export function parseAmount(value: string): number {
  // Remove currency symbols and spaces
  const cleaned = value.replaceAll(/[^0-9.,]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Math.round(parsed * 100);
}
