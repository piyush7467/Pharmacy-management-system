import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { FormField, FormInput, FormSelect } from '../../components/ui/form-system.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '../../components/ui/table.jsx';
import { apiClient } from '../../services/api/apiClient.js';
import { formatDate } from '../../lib/utils.js';

export function StaffManagementView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State for creating new staff
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'PHARMACIST'
  });

  // Fetch Staff List
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['staffUsers', { search: searchTerm, role: roleFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      const res = await apiClient.get(`/users?${params.toString()}`);
      return res.data;
    }
  });

  // Create Staff Mutation
  const createMutation = useMutation({
    mutationFn: (newStaff) => apiClient.post('/users', newStaff),
    onSuccess: (res) => {
      toast.success('Staff account created', {
        description: `${res.data?.user?.fullName} has been added as ${res.data?.user?.role}.`
      });
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
      setAddModalOpen(false);
      setFormData({ fullName: '', email: '', password: '', role: 'PHARMACIST' });
    },
    onError: (err) => {
      toast.error('Failed to create account', {
        description: err.message || 'Please check the submitted details.'
      });
    }
  });

  // Toggle Status (Suspend / Reactivate) Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => apiClient.patch(`/users/${id}/status`, { isActive }),
    onSuccess: (res) => {
      const u = res.data?.user;
      toast.success(u?.isActive ? 'Account reactivated' : 'Account suspended', {
        description: `${u?.fullName} is now ${u?.isActive ? 'Active' : 'Suspended'}.`
      });
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
    },
    onError: (err) => {
      toast.error('Action failed', { description: err.message });
    }
  });

  // Soft Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success('Account deactivated', {
        description: 'Staff account has been soft-deleted and all sessions revoked.'
      });
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
    },
    onError: (err) => {
      toast.error('Delete failed', { description: err.message });
    }
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const usersList = Array.isArray(data) ? data : (data?.users || data?.data || []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Staff & Account Management</h1>
            <Badge variant="default" className="gap-1">
              <Shield className="w-3 h-3" /> ADMIN ONLY
            </Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Provision staff credentials, manage roles (Pharmacist / Cashier), and audit account lifecycles.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} variant="default">
          <UserPlus className="w-4 h-4 mr-1.5" />
          Add Staff Member
        </Button>
      </div>

      {/* Control Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Search staff by full name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 rounded-lg border border-surface bg-surface-card px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Administrators</option>
                <option value="PHARMACIST">Pharmacists</option>
                <option value="CASHIER">Cashiers</option>
              </select>
              <Button onClick={() => refetch()} variant="outline" size="icon" title="Refresh">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Registered Personnel</CardTitle>
          <CardDescription>
            Server-enforced access: Admins manage operations; Pharmacists dispense & receive stock; Cashiers process billing.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-text-muted gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              Loading staff accounts...
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-xs text-red-600 space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto opacity-80" />
              <p>Failed to load staff list: {error?.message}</p>
            </div>
          ) : usersList.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-muted">
              No staff members match the selected criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Assigned Role</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersList.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary">{user.fullName}</span>
                        <span className="text-[11px] text-text-muted">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === 'ADMIN' && (
                        <Badge variant="default" className="font-mono">
                          ADMIN
                        </Badge>
                      )}
                      {user.role === 'PHARMACIST' && (
                        <Badge variant="success" className="font-mono">
                          PHARMACIST
                        </Badge>
                      )}
                      {user.role === 'CASHIER' && (
                        <Badge variant="accent" className="font-mono">
                          CASHIER
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-text-muted">{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {user.role !== 'ADMIN' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: user.id,
                                isActive: !user.isActive
                              })
                            }
                            disabled={toggleStatusMutation.isPending}
                          >
                            {user.isActive ? 'Suspend' : 'Reactivate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
                                deleteMutation.mutate(user.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            title="Soft delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-text-muted italic pr-2">Primary Admin</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                  Add Staff Member
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Create a staff account with role-based operational permissions.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
            <FormField label="Full Name" required helperText="e.g. Diya Sharma">
              <FormInput
                leadingIcon={User}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Staff full legal name"
                required
                autoFocus
              />
            </FormField>

            <FormField label="Staff Email Address" required helperText="Used for system sign-in and security notifications">
              <FormInput
                type="email"
                leadingIcon={Mail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="diya.sharma@pharmapulse.com"
                required
              />
            </FormField>

            <FormField label="Role & Access Scope" required>
              <FormSelect
                leadingIcon={Shield}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="PHARMACIST">Lead Pharmacist (Inventory, GRN & Dispensing)</option>
                <option value="CASHIER">Cashier (POS Checkout & Invoice Billing)</option>
              </FormSelect>
            </FormField>

            <FormField label="Initial Password" required helperText="Minimum 8 characters">
              <FormInput
                type="password"
                leadingIcon={Lock}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </FormField>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                disabled={createMutation.isPending}
                className="h-10 px-5 text-sm font-medium rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {createMutation.isPending ? 'Provisioning...' : 'Create Staff Account'}
                </span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
