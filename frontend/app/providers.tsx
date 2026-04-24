"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import '@/lib/i18n';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance per request/session to avoid cross-request data leakage
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Data stays fresh for 1 minute to reduce API hammering
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        // Always refetch when a component remounts (e.g. after navigating back
        // from a 404 page), and retry once on network/abort errors
        refetchOnMount: true,
        retry: 1,
      },
    },
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
