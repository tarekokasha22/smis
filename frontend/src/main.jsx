import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import App from './App';
import './index.css';

const storedLocale = localStorage.getItem('smis-locale') || 'ar';
const storedDir = localStorage.getItem('smis-dir') || 'rtl';
document.documentElement.lang = storedLocale;
document.documentElement.dir = storedDir;

dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.locale(storedLocale === 'en' ? 'en' : 'ar');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 دقائق
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position={storedDir === 'rtl' ? 'top-left' : 'top-right'}
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Cairo, sans-serif',
              direction: storedDir,
              borderRadius: '12px',
            },
            success: {
              style: { background: '#EAF3DE', color: '#3B6D11', border: '1px solid #3B6D11' },
            },
            error: {
              style: { background: '#FCEBEB', color: '#A32D2D', border: '1px solid #A32D2D' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
