import { z } from "zod";

export const PreferenceItemSchema = z.object({
  categoryId: z.string().max(50).optional(),
  currencyId: z.string().length(3),
  description: z.string().max(500).optional(),
  id: z.string().min(1).max(100),
  pictureUrl: z.string().url().optional(),
  quantity: z.number().int().positive().max(10_000),
  title: z.string().min(1).max(250),
  unitPrice: z.number().positive().max(100_000_000),
});

export const BackUrlsSchema = z.object({
  failure: z.string().url().optional(),
  pending: z.string().url().optional(),
  success: z.string().url().optional(),
});

const RESERVED_METADATA_KEYS = new Set([
  "userId",
  "externalReference",
  "preferenceId",
  "paymentId",
  "subscriptionId",
  "status",
  "amount",
  "currency",
]);

const MetadataValueSchema = z.union([
  z.string().max(1000),
  z.number(),
  z.boolean(),
]);

export const MetadataSchema = z
  .record(z.string(), MetadataValueSchema)
  .refine(
    (data) => {
      const keys = Object.keys(data);
      return !keys.some((key) => RESERVED_METADATA_KEYS.has(key));
    },
    {
      message: "Metadata contains reserved keys",
    }
  )
  .refine(
    (data) => {
      const jsonString = JSON.stringify(data);
      return jsonString.length <= 5000;
    },
    {
      message: "Metadata exceeds maximum size (5KB)",
    }
  );

export const MercadoPagoPreferenceSchema = z.object({
  backUrls: BackUrlsSchema.optional(),
  items: z.array(PreferenceItemSchema).min(1).max(100),
  metadata: MetadataSchema.optional(),
});

export const SubscriptionAutoRecurringSchema = z.object({
  currencyId: z.string().length(3),
  endDate: z.string().datetime().optional(),
  frequency: z.number().int().positive().max(365),
  frequencyType: z.enum(["days", "weeks", "months"]),
  startDate: z.string().datetime().optional(),
  transactionAmount: z.number().positive().max(100_000_000),
});

export const CreateSubscriptionSchema = z.object({
  autoRecurring: SubscriptionAutoRecurringSchema,
  backUrl: z.string().url().optional(),
  idempotencyKey: z.string().max(36).optional(),
  metadata: MetadataSchema.optional(),
  payerEmail: z.string().email(),
  reason: z.string().min(1).max(250),
});

export const IdentificationSchema = z.object({
  number: z.string().min(1).max(20),
  type: z.string().min(1).max(50),
});

export const CreateSubscriptionWithPlanSchema = z.object({
  cardTokenId: z.string().min(1),
  idempotencyKey: z.string().max(36).optional(),
  identification: IdentificationSchema.optional(),
  metadata: MetadataSchema.optional(),
  payerEmail: z.string().email(),
  planId: z.string().min(1),
});

export const CreatePlanSchema = z.object({
  autoRecurring: SubscriptionAutoRecurringSchema,
  description: z.string().max(500).optional(),
  metadata: MetadataSchema.optional(),
  name: z.string().min(1).max(100),
});

export const MarketplaceFeeSchema = z.object({
  type: z.enum(["flat", "percentage"]),
  value: z.number().positive().max(100_000_000),
});

export const CreatePreferenceWithMarketplaceSchema = z.object({
  backUrls: BackUrlsSchema.optional(),
  idempotencyKey: z.string().max(36).optional(),
  items: z.array(PreferenceItemSchema).min(1).max(100),
  marketplaceFee: MarketplaceFeeSchema.optional(),
  metadata: MetadataSchema.optional(),
  sellerId: z.string().min(1),
});

export const UpdateSubscriptionSchema = z.object({
  status: z.enum(["paused", "authorized"]),
});

export type PreferenceItemInput = z.infer<typeof PreferenceItemSchema>;
export type BackUrlsInput = z.infer<typeof BackUrlsSchema>;
export type MetadataInput = z.infer<typeof MetadataSchema>;
export type CreatePreferenceInput = z.infer<typeof MercadoPagoPreferenceSchema>;
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
export type CreateSubscriptionWithPlanInput = z.infer<
  typeof CreateSubscriptionWithPlanSchema
>;
export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;
export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;
