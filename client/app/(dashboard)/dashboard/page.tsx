"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { IndianRupee, ShoppingBag, AlertTriangle, Package, ImageIcon } from 'lucide-react';

interface DashboardData {
  dailySalesTotal: number;
  dailyTransactionCount: number;
  lowStockProducts: { id: string; name: string; stock: number; category: string; imageUrl?: string | null }[];
  lowStockCount: number;
  totalProducts: number;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = [
    {
      label: "Today's Sales",
      value: `₹${(data?.dailySalesTotal ?? 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    {
      label: 'Transactions Today',
      value: data?.dailyTransactionCount ?? 0,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Low Stock Items',
      value: data?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: 'bg-orange-50 text-orange-600',
      iconBg: 'bg-orange-100',
    },
    {
      label: 'Total SKUs',
      value: data?.totalProducts ?? 0,
      icon: Package,
      color: 'bg-indigo-50 text-indigo-600',
      iconBg: 'bg-indigo-100',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">Executive Dashboard</h2>
        <p className="text-muted-foreground font-medium mt-1">Real-time boutique performance and stock alerts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-[2.5rem] border border-border p-6 ${stat.color} transition-all hover:scale-[1.02] duration-300 shadow-sm`}
          >
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${stat.iconBg} shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</p>
                <p className="text-2xl font-black mt-0.5 tracking-tighter">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Low Stock Table */}
        <div className="xl:col-span-3 bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/20">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Stock Replenishment Alerts</h3>
            </div>
            {data && data.lowStockCount > 0 && (
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {data.lowStockCount} Items Need Attention
              </span>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black border-b border-border">
                  <th className="px-8 py-5">Product Details</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5 text-right">Current Stock</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data && data.lowStockProducts.length > 0 ? (
                  data.lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden border border-border flex-shrink-0">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="w-5 h-5 opacity-20" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm uppercase tracking-tight">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">ID: {p.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="bg-muted text-muted-foreground px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-border">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="font-black text-foreground">{p.stock}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            p.stock === 0 ? 'bg-destructive/10 text-destructive' : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {p.stock === 0 ? 'Out of Stock' : 'Critically Low'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground italic font-medium bg-muted/5">
                      Inventory levels are healthy. No replenishment needed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
