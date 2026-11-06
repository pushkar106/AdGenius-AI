import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { creditService } from '../services/creditService';
import { useAuthStore } from '../store/useAuthStore';

export const AppLayout: React.FC = () => {
  const { updateCredits } = useAuthStore();

  useEffect(() => {
    // Fetch initial credit balance on layout load
    creditService
      .getBalance()
      .then((res) => {
        if (res.data?.balance !== undefined) {
          updateCredits(res.data.balance);
        }
      })
      .catch(() => {});
  }, [updateCredits]);

  return (
    <div className="flex min-h-screen bg-dark-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
