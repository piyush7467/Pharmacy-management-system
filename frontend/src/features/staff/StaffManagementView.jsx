import React, { useState, useMemo, useEffect } from 'react';
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
import { TablePagination } from '../../components/ui/table-pagination.jsx';
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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [usersList.length, searchTerm, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return usersList.slice(start, start + pageSize);
  }, [usersList, currentPage, pageSize]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Staff Management</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Provision staff credentials, manage roles (Pharmacist / Cashier), and account permissions.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold gap-2 shadow-sm rounded-lg text-sm">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-surface bg-surface-muted/40 hover:bg-surface-muted/40">
                    <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-wider text-text-muted">Staff Member</TableHead>
                    <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-text-muted">Assigned Role</TableHead>
                    <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-text-muted text-center">Account Status</TableHead>
                    <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-text-muted">Registered On</TableHead>
                    <TableHead className="w-40 text-xs font-semibold uppercase tracking-wider text-text-muted text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="border-surface/60 hover:bg-surface-page/70 transition-colors">
                      <TableCell className="min-w-[200px] align-middle">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-text-primary">{user.fullName}</span>
                          <span className="text-xs text-text-muted mt-0.5">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-36 align-middle">
                        {user.role === 'ADMIN' && (
                          <span className="inline-block text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 rounded-full font-mono">
                            ADMIN
                          </span>
                        )}
                        {user.role === 'PHARMACIST' && (
                          <span className="inline-block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-mono">
                            PHARMACIST
                          </span>
                        )}
                        {user.role === 'CASHIER' && (
                          <span className="inline-block text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 rounded-full font-mono">
                            CASHIER
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="w-36 align-middle text-center">
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
                      <TableCell className="w-36 align-middle text-text-muted text-xs font-medium">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="w-40 align-middle text-right pr-4">
                        {user.role !== 'ADMIN' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs font-medium rounded-lg border-surface cursor-pointer text-text-secondary hover:text-text-primary"
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
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-text-muted hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer rounded-md"
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
                          <span className="text-xs text-text-muted italic pr-2">Primary Admin</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && usersList.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={usersList.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 15, 25, 50]}
            />
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
