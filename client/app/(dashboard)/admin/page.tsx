"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import { Store, Users, Package, ShoppingCart, Plus, Building2, TrendingUp, ShieldCheck, Activity, Globe, Mail, Calendar } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    users: number;
    products: number;
    transactions: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  shop?: { name: string };
}

interface Stats {
  shopCount: number;
  userCount: number;
  productCount: number;
  transactionCount: number;
  totalSales: number;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'shops' | 'users'>('shops');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    ownerEmail: '',
    ownerPasswordHash: '',
  });

  const { data: shops = [] } = useQuery<Shop[]>({
    queryKey: ['admin', 'shops'],
    queryFn: async () => (await api.get('/admin/shops')).data,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => (await api.get('/admin/users')).data,
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  const createShopMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post('/admin/shops', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shops'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      setIsModalOpen(false);
      setFormData({ name: '', ownerName: '', ownerEmail: '', ownerPasswordHash: '' });
    },
  });

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-3">
            <Globe className="w-10 h-10 text-primary" />
            PLATFORM MASTER CONTROL
          </h1>
          <p className="text-muted-foreground font-bold mt-1 uppercase tracking-widest text-[10px] opacity-70">Global SaaS Infrastructure Management</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:opacity-95 transition-all shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] active:scale-95 border-b-4 border-primary-foreground/20"
        >
          <Plus className="w-5 h-5" />
          Onboard New Enterprise
        </button>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Active Shops" value={stats?.shopCount || 0} icon={Store} color="bg-indigo-600" />
        <StatCard title="Total Users" value={stats?.userCount || 0} icon={Users} color="bg-violet-600" />
        <StatCard title="Global SKU" value={stats?.productCount || 0} icon={Package} color="bg-fuchsia-600" />
        <StatCard title="Transactions" value={stats?.transactionCount || 0} icon={ShoppingCart} color="bg-rose-600" />
        <StatCard
          title="Gross Revenue"
          value={`₹${(stats?.totalSales || 0).toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color="bg-emerald-600"
        />
      </div>

      {/* Control Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex p-1.5 bg-muted/50 rounded-[2rem] border border-border shadow-inner backdrop-blur-md">
          <button
            onClick={() => setActiveTab('shops')}
            className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
              activeTab === 'shops' ? 'bg-card text-foreground shadow-2xl ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Registered Shops
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
              activeTab === 'users' ? 'bg-card text-foreground shadow-2xl ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Global Accounts
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-card px-4 py-2 rounded-full border border-border shadow-sm">
          <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
          System Status: Optimal
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-card rounded-[3rem] border border-border shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
        {activeTab === 'shops' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black border-b border-border">
                  <th className="px-10 py-6">Enterprise Entity</th>
                  <th className="px-10 py-6 text-center">Accounts</th>
                  <th className="px-10 py-6 text-center">Inventory</th>
                  <th className="px-10 py-6">Revenue Performance</th>
                  <th className="px-10 py-6 text-right">Provisioned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-muted/20 transition-all group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100 shadow-sm group-hover:rotate-6 transition-transform">
                          {shop.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-foreground text-lg tracking-tight uppercase">{shop.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-1 opacity-60">REF: {shop.id.slice(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <span className="font-black text-base text-foreground">{shop._count.users}</span>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <span className="font-black text-base text-foreground">{shop._count.products}</span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="space-y-1">
                        <span className="font-black text-lg text-emerald-600 tracking-tighter">₹{shop._count.transactions.toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                           <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: '65%' }} />
                          </div>
                          <span className="text-[9px] font-black text-muted-foreground uppercase">High Output</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{new Date(shop.createdAt).toLocaleDateString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black border-b border-border">
                  <th className="px-10 py-6">User Profile</th>
                  <th className="px-10 py-6">Authorization</th>
                  <th className="px-10 py-6">Enterprise Node</th>
                  <th className="px-10 py-6 text-right">Account Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-all group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 font-black text-xl border border-violet-100 shadow-inner">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-foreground text-lg tracking-tight">{user.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                            <Mail className="w-3.5 h-3.5" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                        user.role === 'SUPER_ADMIN' ? 'bg-black text-white border-black' : 
                        user.role === 'OWNER' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      {user.shop ? (
                        <div className="flex items-center gap-2.5 text-sm font-black text-foreground uppercase tracking-tight">
                          <Building2 className="w-4 h-4 text-primary" />
                          {user.shop.name}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em] flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full w-fit">
                          <ShieldCheck className="w-4 h-4" /> GLOBAL ROOT
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-7 text-right">
                      <p className="text-[10px] font-black text-muted-foreground flex items-center justify-end gap-2 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 opacity-40" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboarding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
          <div className="bg-card w-full max-w-2xl rounded-[3rem] border border-border shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-12 border-b border-border bg-muted/20 relative">
               <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-muted rounded-full transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
              <h2 className="text-4xl font-black tracking-tighter">Onboard Enterprise</h2>
              <p className="text-sm text-muted-foreground font-bold mt-2 uppercase tracking-[0.2em] opacity-60">Initialize new business node & root account</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createShopMutation.mutate(formData);
              }}
              className="p-12 space-y-8"
            >
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Legal Enterprise Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-6 py-5 rounded-[1.5rem] border border-input bg-background outline-none focus:ring-8 focus:ring-primary/5 transition-all font-black text-lg placeholder:opacity-30"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ROYAL SUIT EMPORIUM"
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Owner Identity</label>
                  <input
                    type="text"
                    required
                    className="w-full px-6 py-5 rounded-[1.5rem] border border-input bg-background outline-none focus:ring-8 focus:ring-primary/5 transition-all font-bold placeholder:opacity-30"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="FULL NAME"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Primary Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-6 py-5 rounded-[1.5rem] border border-input bg-background outline-none focus:ring-8 focus:ring-primary/5 transition-all font-bold placeholder:opacity-30"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="EMAIL@ENTERPRISE.COM"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Root Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-6 py-5 rounded-[1.5rem] border border-input bg-background outline-none focus:ring-8 focus:ring-primary/5 transition-all font-black text-lg placeholder:opacity-30"
                  value={formData.ownerPasswordHash}
                  onChange={(e) => setFormData({ ...formData, ownerPasswordHash: e.target.value })}
                  placeholder="••••••••••••"
                />
              </div>
              <div className="flex gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-5 rounded-[1.5rem] border border-input hover:bg-muted font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createShopMutation.isPending}
                  className="flex-[2] bg-primary text-primary-foreground px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:opacity-95 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {createShopMutation.isPending ? 'Provisioning Node...' : 'Authorize & Provision Enterprise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm flex items-center gap-6 transition-all hover:scale-[1.05] hover:shadow-2xl duration-500 group">
      <div className={`${color} p-5 rounded-[1.5rem] text-white shadow-xl shadow-inner group-hover:rotate-12 transition-transform`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">{title}</p>
        <p className="text-3xl font-black text-foreground mt-1 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}
