'use client';

import React, { ReactNode } from 'react';
import { config } from '@/lib/wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// This file is now obsolete as the providers have been moved to the root layout.
// It is being kept for now to avoid breaking imports, but it no longer does anything.
// This is a candidate for deletion in a future cleanup.

export function Web3Provider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
