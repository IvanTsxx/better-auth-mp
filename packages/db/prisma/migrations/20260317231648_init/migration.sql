-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercadoPagoPayment" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "externalReference" TEXT NOT NULL,
    "mercadoPagoPaymentId" TEXT,
    "metadata" TEXT,
    "paymentMethodId" TEXT,
    "paymentTypeId" TEXT,
    "preferenceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "statusDetail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "mercadoPagoPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercadoPagoPlan" (
    "id" TEXT NOT NULL,
    "autoRecurringFrequency" INTEGER NOT NULL,
    "autoRecurringFrequencyType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "description" TEXT,
    "metadata" TEXT,
    "mpPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "transactionAmount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mercadoPagoPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercadoPagoSubscription" (
    "id" TEXT NOT NULL,
    "autoRecurringFrequency" INTEGER,
    "autoRecurringFrequencyType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "currencyId" TEXT,
    "externalReference" TEXT NOT NULL,
    "metadata" TEXT,
    "mpSubscriptionId" TEXT,
    "nextPaymentDate" TIMESTAMP(3),
    "payerEmail" TEXT,
    "planId" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL,
    "transactionAmount" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "mercadoPagoSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "mercadoPagoPayment_userId_idx" ON "mercadoPagoPayment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mercadoPagoPayment_externalReference_key" ON "mercadoPagoPayment"("externalReference");

-- CreateIndex
CREATE UNIQUE INDEX "mercadoPagoPayment_mercadoPagoPaymentId_key" ON "mercadoPagoPayment"("mercadoPagoPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "mercadoPagoPlan_mpPlanId_key" ON "mercadoPagoPlan"("mpPlanId");

-- CreateIndex
CREATE INDEX "mercadoPagoSubscription_userId_idx" ON "mercadoPagoSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mercadoPagoSubscription_externalReference_key" ON "mercadoPagoSubscription"("externalReference");

-- CreateIndex
CREATE UNIQUE INDEX "mercadoPagoSubscription_mpSubscriptionId_key" ON "mercadoPagoSubscription"("mpSubscriptionId");
