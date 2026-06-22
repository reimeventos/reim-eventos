'use client';

import { ReactNode } from 'react';
import { SupplierSubscriptionGuard } from '@/components/SupplierSubscriptionGuard';

export default function PainelFornecedorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SupplierSubscriptionGuard>{children}</SupplierSubscriptionGuard>;
}
