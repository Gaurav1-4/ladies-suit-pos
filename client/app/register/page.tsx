'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import api from '@/lib/api';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Sign up in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Signup failed');

      // 2. Provision Shop and Owner in our Backend
      // We pass the supabase user ID to link them
      await api.post('/admin/shops', {
        name: shopName,
        ownerName,
        ownerEmail: email,
        ownerPasswordHash: 'EXTERNAL_SUPABASE_AUTH', // We don't store passwords in DB anymore
        supabaseId: authData.user.id
      });

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-[2.5rem] border border-border shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-black text-foreground tracking-tighter">CREATE YOUR BOUTIQUE</h2>
          <p className="text-muted-foreground mt-2 font-medium uppercase text-[10px] tracking-widest">SaaS Cloud POS Migration</p>
        </div>

        <form className="space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-xs font-bold rounded-2xl border border-destructive/20 text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Shop Name</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:font-medium"
                placeholder="e.g. Antra Creations"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Owner Name</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:font-medium"
                placeholder="Your Full Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:font-medium"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Secure Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'PROVISIONING...' : 'LAUNCH MY SHOP'}
          </button>
        </form>

        <div className="text-center pt-4">
          <Link href="/login" className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
