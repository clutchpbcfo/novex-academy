'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, string>;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: { retry: 1, refetchOnWindowFocus: false },
      },
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        <DynamicContextProvider
          theme="dark"
          settings={{
            environmentId: '78f7e6ec-d6ca-4dc0-988c-76a50158678a',
            walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
            appName: 'Novex Academy',
          }}
        >
          {children}
        </DynamicContextProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}
