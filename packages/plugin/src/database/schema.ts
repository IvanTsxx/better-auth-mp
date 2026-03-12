/**
 * better-auth-mercadopago - Database Schema
 *
 * Prisma schema for MercadoPago plugin tables
 * Add this to your existing Prisma schema
 */

export const mercadopagoSchema = `
/// MercadoPago Payment Table
/// Stores one-time payment records
model MercadoPagoPayment {
  id              String   @id @default(cuid())
  mpPaymentId     String   @unique /// MercadoPago payment ID
  userId          String   /// User who made the payment
  items           Json     /// Array of items purchased
  amount          Int      /// Total amount in cents
  currency        String   @default("ARS")
  status          String   @default("pending") /// pending, approved, rejected, cancelled, refunded
  paymentMethod   String?  /// card, pix, ticket, etc.
  externalRef     String?  /// External reference (your internal ID)
  metadata        Json?     /// Additional metadata
  transactionId   String?  /// MP transaction ID
  paymentLink     String?  /// URL for payment
  
  /// Split/Marketplace fields
  splitEnabled    Boolean  @default(false)
  sellerEmail     String?  /// Seller email for split payments
  commissionAmount Int?    /// Commission amount in cents
  netAmount       Int?     /// Net amount after commission in cents
  
  approvedAt      DateTime? /// When payment was approved
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@index([mpPaymentId])
}

/// MercadoPago Subscription Table
/// Stores subscription/recurring payment records
model MercadoPagoSubscription {
  id                String   @id @default(cuid())
  mpSubscriptionId  String   @unique /// MercadoPago subscription ID
  userId            String   /// User who subscribed
  items             Json     /// Array of subscription items
  planId            String?  /// Link to plan if created from one
  
  amount            Int      /// Subscription amount in cents
  currency          String   @default("ARS")
  frequency         Int      /// Billing frequency
  frequencyType     String   /// days, weeks, months, years
  
  status            String   @default("pending") /// pending, authorized, paused, cancelled, expired
  
  /// Split/Marketplace fields for subscriptions
  splitEnabled      Boolean  @default(false)
  sellerEmail       String?  /// Seller email for split payments
  commissionAmount  Int?     /// Commission amount in cents
  
  startDate         DateTime? /// Subscription start date
  endDate           DateTime? /// Subscription end date
  nextBillingDate   DateTime? /// Next billing date
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([mpSubscriptionId])
  @@index([planId])
}

/// MercadoPago Plan Table
/// Stores subscription plans created in MercadoPago
model MercadoPagoPlan {
  id            String   @id @default(cuid())
  mpPlanId      String   @unique /// MercadoPago plan ID
  items         Json     /// Array of plan items
  
  name          String   /// Plan name
  amount        Int      /// Plan amount in cents
  currency      String   @default("ARS")
  frequency     Int      /// Billing frequency
  frequencyType String   /// days, weeks, months, years
  description   String?  /// Plan description
  isActive      Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([isActive])
  @@index([mpPlanId])
}

/// Marketplace Split Table
/// Tracks split payments between seller and platform
model MarketplaceSplit {
  id              String   @id @default(cuid())
  paymentId       String?  /// Link to payment if one-time
  subscriptionId  String?  /// Link to subscription if recurring
  sellerEmail     String   /// Seller's MercadoPago email
  
  items           Json     /// Original items from the order
  totalAmount     Int      /// Total order amount in cents
  commissionAmount Int     /// Platform commission in cents
  netAmount       Int      /// Seller's net amount in cents
  
  status          String   @default("pending") /// pending, paid, failed
  paidAt          DateTime? /// When the split was paid
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([paymentId])
  @@unique([subscriptionId])
  @@index([sellerEmail])
  @@index([status])
}
`;

/**
 * These are the indexes that should be added to your existing user table
 * to link payments and subscriptions to users
 */
export const userTableIndexes = `
/// Add to your existing User model:
@@index([id]) // Already exists by default

/// If you want to quickly find a user's payments:
@@index([id, createdAt]) // For "user's recent payments"
`;
