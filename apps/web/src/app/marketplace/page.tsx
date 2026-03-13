"use client";

import type { MercadopagoItem } from "better-auth-mercadopago/types";
import {
  Store,
  Users,
  Percent,
  DollarSign,
  ArrowRight,
  Loader2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

/**
 * Productos de marketplace de demo
 */
const PRODUCTOS_MARKETPLACE = [
  {
    description: "Bolso de cuero hecho a mano",
    id: "mp_001",
    name: "Bolso de Cuero Artesanal",
    price: 12_500,
    seller: {
      email: "vendedor1@demo.com",
      name: "LeatherCraft Co.",
    },
  },
  {
    description: "Set de 3 jarrones de cerámica artesanal",
    id: "mp_002",
    name: "Set de Jarrones de Cerámica",
    price: 4500,
    seller: {
      email: "vendedor2@demo.com",
      name: "Cerámica Artesanal",
    },
  },
  {
    description: "1kg de miel orgánica de flores silvestres",
    id: "mp_003",
    name: "Miel Orgánica",
    price: 2800,
    seller: {
      email: "vendedor3@demo.com",
      name: "Finca BeeHappy",
    },
  },
];

/**
 * Configuración de comisión (viene de la config del plugin)
 */
const TASA_COMISION = 10;

function formatPrice(cents: number, currency = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    currency,
    style: "currency",
  }).format(cents / 100);
}

type ProductoDemo = (typeof PRODUCTOS_MARKETPLACE)[number];

export default function MarketplacePage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductoDemo | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProductSelect = (product: ProductoDemo) => {
    setSelectedProduct(product);
  };

  const totalAmount = selectedProduct ? selectedProduct.price * quantity : 0;
  const commissionAmount = Math.round((totalAmount * TASA_COMISION) / 100);
  const netAmount = totalAmount - commissionAmount;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Store className="h-8 w-8" />
          Marketplace - Demo
        </h1>
        <p className="text-muted-foreground mt-2">
          Ejemplo de pagos split (marketplace) con seguimiento de comisiones
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Selección de Productos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Explorar Productos
          </h2>

          {PRODUCTOS_MARKETPLACE.map((product) => (
            <Card
              key={product.id}
              className={`cursor-pointer transition-all ${
                selectedProduct?.id === product.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-muted-foreground"
              }`}
              onClick={() => handleProductSelect(product)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {product.seller.name}
                    </div>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checkout con Split */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compra Segura</CardTitle>
              <CardDescription>
                Checkout con pago split automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resumen del Producto */}
              {selectedProduct ? (
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium mb-2">Producto</h4>
                  <div className="flex justify-between items-center">
                    <span>{selectedProduct.name}</span>
                    <span>{formatPrice(selectedProduct.price)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Label htmlFor="mp-qty" className="text-sm">
                      Cantidad:
                    </Label>
                    <Input
                      id="mp-qty"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(1, Number.parseInt(e.target.value, 10) || 1)
                        )
                      }
                      className="w-20"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted p-4 text-center text-muted-foreground">
                  Seleccioná un producto para continuar
                </div>
              )}
              {/* Detalles del Split */}
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Distribución del Pago
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monto Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Comisión de Plataforma ({TASA_COMISION}%)</span>
                    <span className="text-destructive">
                      -{formatPrice(commissionAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2 mt-2">
                    <span>El Vendedor Recibe</span>
                    <span className="text-green-600">
                      {formatPrice(netAmount)}
                    </span>
                  </div>
                </div>
              </div>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="mp-email">Tu Email</Label>
                <Input
                  id="mp-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {/* Error */}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </div>
              )}
              {/* Botón de Compra */}
              <Button
                className="w-full"
                size="lg"
                disabled={!selectedProduct || !email || isLoading}
                /* onClick={handleBuy} */
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Pagar {formatPrice(totalAmount)}
                    <ArrowRight className="-4 w-4" />
                  </>
                )}
              </Button>
              ml-2 h{" "}
              <p className="text-xs text-center text-muted-foreground">
                El pago se spliteará automáticamente entre vendedor y plataforma
              </p>
            </CardContent>
          </Card>

          {/* Info del Vendedor */}
          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Información del Vendedor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedProduct.seller.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedProduct.seller.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ejemplo de Código */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ejemplo de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{`await mercadopago.createPayment({
  items: [{
    id: "mp_001",
    title: "Bolso de Cuero",
    quantity: 1,
    unitPrice: 12500,
  }],
  email: "comprador@ejemplo.com",
  splitEnabled: true,
  sellerEmail: "vendedor@demo.com",
});`}</code>
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                El plugin calcula automáticamente la comisión (10%) y splittea
                el pago
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
