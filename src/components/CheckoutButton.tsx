"use client";
import { CHECKOUT_URL } from "@/lib/offer";

// Link simples para o checkout externo (EscalePay). Sem Stripe.
export default function CheckoutButton({
  children,
  className = "btn",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a href={CHECKOUT_URL} className={className} style={style} rel="noopener">
      {children}
    </a>
  );
}
