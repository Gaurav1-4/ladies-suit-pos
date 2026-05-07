import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2, UserPlus, Mail, Shield, X } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function Staff() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const { data: staff = [], isLoading } = useQuery<StaffMember[]>({
    queryKey: ['staff'],
    queryFn: async () => (await api.get('/users/staff')).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/users/staff', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsModalOpen(false);
      setForm({ name: '', email: '', password: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/staff/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Staff Management</h2>
          <p className="text-sm text-muted-foreground">Manage your shop employees and their access</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-95 shadow-md"
        >
          <UserPlus className="w-5 h-5" /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow relative group">
            {member.role !== 'OWNER' && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to remove this staff member?')) {
                    deleteMutation.mutate(member.id);
                  }
                }}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                member.role === 'OWNER' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {member.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  member.role === 'OWNER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {member.role}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {member.email}
              </p>
              <p className="flex items-center gap-2">
                <Shield className="w-4 h-4" /> Joined {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(form);
            }}
            className="bg-card rounded-3xl border border-border p-8 w-full max-w-md shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-bold">New Staff Account</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Employee Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="staff@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Temporary Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating Account...' : 'Create Staff Account'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
