export type PaymentStatus =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

export type SubscriptionStatus =
  | "pending"
  | "authorized"
  | "paused"
  | "cancelled"
  | "expired"
  | "unpaid";

export interface PreferenceItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  currencyId: string;
  pictureUrl?: string;
  categoryId?: string;
}

// Alias for backward compatibility
export type MercadopagoItem = PreferenceItem;

export interface BackUrls {
  success?: string;
  failure?: string;
  pending?: string;
}

export interface CreatePreferenceInput {
  items: PreferenceItem[];
  backUrls?: BackUrls;
  metadata?: Record<string, unknown>;
  // Para marketplace - ID del vendedor
  sellerId?: string;
  // Para marketplace - comisión (en centavos)
  marketplaceFee?: number;
  // Para evitar duplicados
  idempotencyKey?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  dateCreatedFrom?: string;
  dateCreatedTo?: string;
}

export interface PreferenceOutput {
  checkoutUrl: string;
  preferenceId: string;
  paymentId: string;
  sandboxCheckoutUrl?: string;
}

export interface PaymentOutput {
  externalReference: string;
  userId: string;
  mpPaymentId?: string;
  preferenceId: string;
  status: PaymentStatus;
  statusDetail?: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedPayments {
  payments: PaymentOutput[];
  total: number;
  limit: number;
  offset: number;
}

export interface SubscriptionOutput {
  checkoutUrl: string;
  subscriptionId: string;
  status: string;
}

export interface PlanOutput {
  planId: string;
  name: string;
  url: string;
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  planId?: string;
}

export interface PaginatedSubscriptions {
  subscriptions: unknown[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaginatedPlans {
  plans: unknown[];
  total: number;
  limit: number;
  offset: number;
}

export interface MPWebhookNotification {
  type: "payment" | "subscription" | "plan" | "subscription_preapproval";
  action: string;
  data: {
    id: string;
  };
}

export interface PaymentEvent {
  type: "payment";
  action: string;
  mpPaymentId: string;
  externalReference: string;
  status: PaymentStatus;
  statusDetail?: string;
}

export interface SubscriptionEvent {
  type: "subscription";
  action: string;
  mpSubscriptionId: string;
  externalReference: string;
  status: SubscriptionStatus;
}

export interface MercadoPagoPluginConfig {
  /** Access token de MercadoPago */
  accessToken: string;
  /** URL base para callbacks (default: ctx.context.baseURL) */
  baseUrl?: string;
  /** Secret para verificar firma del webhook */
  webhookSecret?: string;
  /** Callback para eventos de pago */
  onPaymentUpdate?: (event: PaymentEvent) => void | Promise<void>;
  /** Callback para eventos de suscripción */
  onSubscriptionUpdate?: (event: SubscriptionEvent) => void | Promise<void>;
  /** Configuración de marketplace */
  marketplace?: {
    /** Habilitar marketplace */
    enabled?: boolean;
    /** Client ID para OAuth (obtenido de tu app en MercadoPago) */
    clientId?: string;
    /** Client Secret para OAuth */
    clientSecret?: string;
    /** URL de callback para OAuth */
    redirectUri?: string;
  };
}

export const mercadopagoPaymentSchema = {
  fields: {
    amount: {
      required: true,
      type: "number" as const,
    },

    createdAt: {
      required: true,
      type: "date" as const,
    },

    currency: {
      required: true,
      type: "string" as const,
    },

    externalReference: {
      required: true,
      type: "string" as const,
      unique: true,
    },

    metadata: {
      type: "string" as const,
    },

    mpPaymentId: {
      type: "string" as const,
      unique: true,
    },

    paymentMethodId: {
      type: "string" as const,
    },

    paymentTypeId: {
      type: "string" as const,
    },

    preferenceId: {
      required: true,
      type: "string" as const,
    },

    status: {
      required: true,
      type: "string" as const,
    },

    statusDetail: {
      type: "string" as const,
    },

    updatedAt: {
      required: true,
      type: "date" as const,
    },
    userId: {
      references: {
        field: "id" as const,
        model: "user" as const,
      },
      required: true,
      type: "string" as const,
    },
  },
} as const;

export const mercadopagoSubscriptionSchema = {
  fields: {
    autoRecurringFrequency: {
      type: "number" as const,
    },
    autoRecurringFrequencyType: {
      type: "string" as const,
    },
    createdAt: {
      required: true,
      type: "date" as const,
    },
    currencyId: {
      type: "string" as const,
    },
    externalReference: {
      required: true,
      type: "string" as const,
      unique: true,
    },
    metadata: {
      type: "string" as const,
    },
    mpSubscriptionId: {
      type: "string" as const,
      unique: true,
    },
    nextPaymentDate: {
      type: "date" as const,
    },
    payerEmail: {
      type: "string" as const,
    },
    planId: {
      type: "string" as const,
    },
    reason: {
      type: "string" as const,
    },
    status: {
      required: true,
      type: "string" as const,
    },
    transactionAmount: {
      type: "number" as const,
    },
    updatedAt: {
      required: true,
      type: "date" as const,
    },
    userId: {
      references: {
        field: "id" as const,
        model: "user" as const,
      },
      required: true,
      type: "string" as const,
    },
  },
} as const;

export const mercadopagoPlanSchema = {
  fields: {
    autoRecurringFrequency: {
      required: true,
      type: "number" as const,
    },
    autoRecurringFrequencyType: {
      required: true,
      type: "string" as const,
    },
    currencyId: {
      required: true,
      type: "string" as const,
    },
    description: {
      type: "string" as const,
    },
    metadata: {
      type: "string" as const,
    },
    mpPlanId: {
      required: true,
      type: "string" as const,
      unique: true,
    },
    name: {
      required: true,
      type: "string" as const,
    },
    transactionAmount: {
      required: true,
      type: "number" as const,
    },
  },
} as const;

export const mercadopagoSellerSchema = {
  fields: {
    accessToken: {
      required: true,
      type: "string" as const,
    },
    dateConnected: {
      required: true,
      type: "date" as const,
    },
    mpSellerId: {
      required: true,
      type: "string" as const,
    },
    refreshToken: {
      type: "string" as const,
    },
    status: {
      type: "string" as const,
    },
    tokenExpiresAt: {
      type: "date" as const,
    },
    userId: {
      references: {
        field: "id" as const,
        model: "user" as const,
      },
      required: true,
      type: "string" as const,
    },
  },
} as const;

export interface MercadoPagoPayment {
  externalReference: string;
  userId: string;
  mpPaymentId?: string;
  preferenceId?: string;
  status: string;
  statusDetail?: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MercadoPagoSubscription {
  externalReference: string;
  userId: string;
  mpSubscriptionId?: string;
  planId?: string;
  status: string;
  reason?: string;
  autoRecurringFrequency?: number;
  autoRecurringFrequencyType?: string;
  transactionAmount?: number;
  currencyId?: string;
  payerEmail?: string;
  nextPaymentDate?: Date;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MercadoPagoPlan {
  mpPlanId: string;
  name: string;
  description?: string;
  autoRecurringFrequency: number;
  autoRecurringFrequencyType: string;
  transactionAmount: number;
  currencyId: string;
  metadata?: string;
}

export interface MercadoPagoSeller {
  userId: string;
  mpSellerId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  status?: string;
  dateConnected: Date;
}

/**
 * Webhook notification from MercadoPago
 */
export interface MercadoPagoPaymentNotification {
  type: "payment" | "subscription" | "plan" | "subscription_preapproval";
  action: string;
  data: {
    id: number;
  };
}

/**
 * Payment record from database
 */
export interface MercadoPagoPaymentRecord {
  id: string;
  externalReference: string;
  userId: string;
  mercadoPagoPaymentId?: string;
  preferenceId: string;
  status: string;
  statusDetail?: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Options for the MercadoPago plugin
 */
export interface MercadoPagoPluginOptions {
  /** Access token from MercadoPago */
  accessToken: string;
  /** Base URL for callbacks (default: ctx.context.baseURL) */
  baseUrl?: string;
  /** Secret for webhook signature verification */
  webhookSecret?: string;
  /** Callback when payment status updates */
  onPaymentUpdate?: (params: {
    payment: MercadoPagoPaymentRecord;
    status: string;
    statusDetail: string;
    mpPayment: {
      id?: number;
      status?: string;
      status_detail?: string;
      transaction_amount?: number;
      currency_id?: string;
      payment_method_id?: string;
      payment_type_id?: string;
      external_reference?: string;
    };
    /** Simplified result type for the 3 main Checkout Pro states */
    resultType: "success" | "pending" | "error";
  }) => void | Promise<void>;
  /** Callback when subscription status updates */
  onSubscriptionUpdate?: (params: {
    subscription: MercadoPagoSubscriptionRecord;
    status: string;
    mpSubscription: unknown;
  }) => void | Promise<void>;
  /** Marketplace configuration */
  marketplace?: {
    enabled?: boolean;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
  };
}

/**
 * Subscription record from database
 */
export interface MercadoPagoSubscriptionRecord {
  id: string;
  externalReference: string;
  userId: string;
  mpSubscriptionId?: string;
  planId?: string;
  status: string;
  reason?: string;
  autoRecurringFrequency?: number;
  autoRecurringFrequencyType?: string;
  transactionAmount?: number;
  currencyId?: string;
  payerEmail?: string;
  nextPaymentDate?: Date;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Plan record from database
 */
export interface MercadoPagoPlanRecord {
  id: string;
  mpPlanId: string;
  name: string;
  description?: string;
  autoRecurringFrequency: number;
  autoRecurringFrequencyType: string;
  transactionAmount: number;
  currencyId: string;
  metadata?: string;
}

/**
 * Seller record from database
 */
export interface MercadoPagoSellerRecord {
  userId: string;
  mpSellerId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  status?: string;
  dateConnected: Date;
}
