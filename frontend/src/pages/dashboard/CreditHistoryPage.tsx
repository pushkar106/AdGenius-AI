import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  CreditCard,
  Layers,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { creditService } from '../../services/creditService';
import { CreditAccount, CreditTransaction } from '../../types';
import toast from 'react-hot-toast';

export const CreditHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<CreditAccount | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [accRes, txRes] = await Promise.all([
        creditService.getBalance(),
        creditService.getTransactions(0, 50),
      ]);
      if (accRes.data) setAccount(accRes.data);
      if (txRes.data?.content) setTransactions(txRes.data.content);
    } catch {
      toast.error('Failed to load credit ledger');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="pb-20">
      <Header
        title="Credit Ledger & Consumption"
        subtitle="Transparent audit trail of every credit grant, deduction, and automated failure refund."
        actions={
          <Button
            onClick={() => navigate('/pricing')}
            variant="primary"
            size="sm"
            leftIcon={<CreditCard className="w-3.5 h-3.5" />}
          >
            Refill Credits
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        {/* Balance Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card glow className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Credits</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{account?.balance ?? 50}</span>
              <span className="text-xs text-amber-300 font-semibold">Credits</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Concurrency-locked ledger balance</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lifetime Granted</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{account?.lifetimeGranted ?? 50}</span>
              <span className="text-xs text-emerald-400 font-semibold">+Credits</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Welcome credits + plan top-ups</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lifetime Spent</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{account?.lifetimeSpent ?? 0}</span>
              <span className="text-xs text-rose-400 font-semibold">Used</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">AI synthesis expenditure</p>
          </Card>
        </div>

        {/* Ledger Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Transaction Ledger</h3>
              <p className="text-xs text-slate-400">Every single debit and credit recorded with idempotency hashing</p>
            </div>
            <Button size="sm" variant="secondary" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Operation Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Ledger Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-dark-850/50 transition">
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <Badge
                          variant={
                            tx.type.includes('REFUND') || tx.type.includes('GRANT')
                              ? 'success'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                        {tx.description || 'AI Generation Execution'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-white font-semibold">{tx.balanceAfter}</td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                        {tx.referenceType || 'SYS'}#{tx.referenceId || tx.id}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
