import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Clock,
  Layers,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Input } from '../../components/ui/input.jsx';
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

export function AuditView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const { data: auditData, isLoading } = useQuery({
    queryKey: ['audit-logs', actionFilter],
    queryFn: async () => {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      const res = await apiClient.get('/audit-logs', { params });
      return Array.isArray(res.data) ? res.data : (res.data?.logs || res.data?.data || res || []);
    }
  });

  const logs = Array.isArray(auditData) ? auditData : (auditData?.data || auditData?.logs || []);

  const getActionBadge = (action) => {
    switch (action) {
      case 'PROCESS_SALE':
        return (
          <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]">
            Sale Billed
          </Badge>
        );
      case 'RECEIVE_PURCHASE':
        return (
          <Badge variant="default" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 text-[11px]">
            Stock Intake
          </Badge>
        );
      case 'PROCESS_RETURN':
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[11px]">
            Customer Refund
          </Badge>
        );
      case 'STOCK_ADJUSTMENT':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px]">
            Stock Adjustment
          </Badge>
        );
      case 'SUSPEND_USER':
      case 'DELETE_USER':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-[11px]">
            Staff Security
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[11px]">{action}</Badge>;
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.entityName?.toLowerCase().includes(term) ||
      log.actor?.fullName?.toLowerCase().includes(term) ||
      log.entityId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-brand-primary" />
            System Audit Trail
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Immutable log of high-consequence administrative changes, inventory modifications, and billing actions.
          </p>
        </div>
        <Badge variant="outline" className="text-brand-primary border-brand-primary/20 bg-brand-primary/5 py-1 px-3">
          Admin Privilege Active
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-surface-card border-surface">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Filter by action, entity, actor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface-bg border-surface text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-surface-bg border border-surface rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="">All Audit Actions</option>
              <option value="PROCESS_SALE">PROCESS_SALE</option>
              <option value="RECEIVE_PURCHASE">RECEIVE_PURCHASE</option>
              <option value="PROCESS_RETURN">PROCESS_RETURN</option>
              <option value="STOCK_ADJUSTMENT">STOCK_ADJUSTMENT</option>
              <option value="SUSPEND_USER">SUSPEND_USER</option>
              <option value="DELETE_USER">DELETE_USER</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="bg-surface-card border-surface">
        <CardHeader className="p-4 pb-2 border-b border-surface">
          <CardTitle className="text-base font-semibold text-text-primary flex items-center justify-between">
            <span>Immutable Ledger Records</span>
            <span className="text-xs font-normal text-text-muted">{filteredLogs.length} event(s) logged</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <p className="text-sm">Loading security audit records...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-text-muted">
              <ShieldAlert className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
              <p className="font-medium text-text-primary">No audit records found</p>
              <p className="text-xs text-text-muted mt-1">Actions performed across the system will be tracked here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-surface hover:bg-transparent">
                    <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                    <TableHead className="text-xs font-semibold">Action</TableHead>
                    <TableHead className="text-xs font-semibold">Entity Affected</TableHead>
                    <TableHead className="text-xs font-semibold">Actor / Role</TableHead>
                    <TableHead className="text-xs font-semibold">IP Address</TableHead>
                    <TableHead className="text-xs font-semibold text-right pr-4">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-surface hover:bg-surface-bg/50">
                      <TableCell className="text-xs text-text-muted font-mono">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-xs text-text-primary">{log.entityName}</span>
                        <div className="text-[10px] text-text-muted font-mono truncate max-w-[140px]">
                          {log.entityId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs text-text-primary">
                          {log.actor?.fullName || 'System Automated'}
                        </div>
                        {log.actor?.role && (
                          <span className="text-[10px] text-text-muted uppercase font-bold">
                            {log.actor.role}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-text-muted">
                        {log.ipAddress || '127.0.0.1'}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-text-muted hover:text-brand-primary gap-1"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect Diff
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* INSPECT DIFF MODAL */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-xl bg-surface-card border-surface">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-text-primary flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-primary" />
              Audit Event Payload: {selectedLog?.action}
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Structured event context and database state transitions.
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl border border-surface bg-surface-bg/40 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-text-muted block text-[11px]">Logged Timestamp:</span>
                  <span className="font-semibold">{formatDate(selectedLog.createdAt)}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Executing User:</span>
                  <span className="font-semibold">{selectedLog.actor?.fullName || 'System'}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Target Entity:</span>
                  <span className="font-semibold">{selectedLog.entityName}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Target ID:</span>
                  <span className="font-mono text-[11px] truncate block">{selectedLog.entityId}</span>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1 block">Event Diff Payload</Label>
                <pre className="p-3.5 rounded-xl border border-surface bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[240px]">
                  {JSON.stringify(selectedLog.diff, null, 2)}
                </pre>
              </div>

              {selectedLog.userAgent && (
                <div className="p-2.5 rounded-lg border border-surface bg-surface-bg/20 text-[10px] text-text-muted font-mono truncate">
                  User Agent: {selectedLog.userAgent}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
