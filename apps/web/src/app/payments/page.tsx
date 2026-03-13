"use client";

import type { MercadopagoItem } from "better-auth-mp/types";
import {
  CreditCard,
  ShoppingCart,
  Package,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

/**
 * Productos de demo para pagos únicos
 */
const PRODUCTOS_DEMO = [
  {
    description: "Acceso a todas las funciones premium por 1 mes",
    id: "prod_001",
    image:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop",
    name: "Membresía Premium",
    price: 1500,
  },
  {
    description: "Libro digital con todos los secretos",
    id: "prod_002",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop",
    name: "E-book: Guía Completa",
    price: 499,
  },
  {
    description: "Videollamada de 1 hora con un experto",
    id: "prod_003",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop",
    name: "Sesión de Consultoría",
    price: 7500,
  },
];

/**
 * Formatear precio de centavos a moneda
 */
function formatPrice(value: number, currency = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    currency,
    style: "currency",
  }).format(value);
}

export default function PaymentsPage() {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(["prod_001"])
  );
  const [quantity, setQuantity] = useState<Record<string, number>>({
    prod_001: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const qty = Number.parseInt(value, 10) || 1;
    setQuantity((prev) => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  const selectedItems: MercadopagoItem[] = PRODUCTOS_DEMO.filter((p) =>
    selectedProducts.has(p.id)
  ).map((product) => ({
    currencyId: "ARS",
    description: product.description,
    id: product.id,
    pictureUrl: product.image,
    quantity: quantity[product.id] || 1,
    title: product.name,
    unitPrice: product.price,
  }));

  const total = selectedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      setError("Selecciona al menos un producto");
      return;
    }

    setError(null);

    // Usamos toast.promise para manejar el estado de la promesa
    toast.promise(
      async () => {
        setIsLoading(true);
        const result = await authClient.mercadoPago.createPayment({
          backUrls: {
            failure: `${window.location.origin}/payments/failure`,
            pending: `${window.location.origin}/payments/pending`,
            success: `${window.location.origin}/payments/success`,
          },
          items: selectedItems,
        });

        if (!result.data) {
          throw new Error(result.error?.message || "Error desconocido");
        }

        // Redirigimos al checkout de MercadoPago
        window.location.href = result.data.checkoutUrl;
        return result.data;
      },
      {
        error: (err) => `Error al crear el pago: ${err.message || err}`,
        finally: () => setIsLoading(false),
        loading: "Creando pago...",
        success: () => "Pago creado! Redirigiendo a MercadoPago",
      }
    );
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="h-8 w-8" />
            Pagos Únicos - Demo
          </h1>
          <Link
            href={"/payments/history" as Route}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Ver historial de pagos
          </Link>
        </div>
        <p className="text-muted-foreground mt-2">
          Ejemplo de cómo crear pagos únicos con items usando el plugin de
          MercadoPago
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Selección de Productos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Seleccionar Productos
          </h2>

          {PRODUCTOS_DEMO.map((product) => (
            <Card
              key={product.id}
              className={`cursor-pointer transition-all ${
                selectedProducts.has(product.id)
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-muted-foreground"
              }`}
              onClick={() => handleProductToggle(product.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => handleProductToggle(product.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{product.name}</h3>
                      <span className="font-semibold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>
                    {selectedProducts.has(product.id) && (
                      <div className="mt-3 flex items-center gap-2">
                        <Label
                          htmlFor={`qty-${product.id}`}
                          className="text-sm"
                        >
                          Cantidad:
                        </Label>
                        <Input
                          id={`qty-${product.id}`}
                          type="number"
                          min="1"
                          value={quantity[product.id] || 1}
                          onChange={(e) =>
                            handleQuantityChange(product.id, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Formulario de Checkout */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Checkout
              </CardTitle>
              <CardDescription>Completá los datos del pago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resumen del Pedido */}
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Resumen del Pedido</h4>
                {selectedItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay productos seleccionados
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {selectedItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.title} x{item.quantity}
                        </span>
                        <span>
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </li>
                    ))}
                    <li className="flex justify-between font-medium border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </li>
                  </ul>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </div>
              )}

              {/* Botón de Pago */}
              <Button
                className="w-full"
                size="lg"
                disabled={selectedItems.length === 0 || isLoading}
                onClick={handleCheckout}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Pagar {formatPrice(total)}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                En producción, esto redirigirá al checkout de MercadoPago
              </p>
            </CardContent>
          </Card>

          {/* Ejemplo de Código */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ejemplo de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{`
await authClient.mercadoPago.createPayment({
  backUrls: {
    failure: "${window.location.origin}/payments/failure",
    pending: "${window.location.origin}/payments/pending",
    success: "${window.location.origin}/payments/success",
  },
  items: selectedItems,
});`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
