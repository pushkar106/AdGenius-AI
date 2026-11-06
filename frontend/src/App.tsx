import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0B0F19',
              color: '#F1F5F9',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              fontSize: '12px',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
};
export default App;
