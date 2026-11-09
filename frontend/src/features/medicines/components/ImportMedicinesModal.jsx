import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { apiClient } from '../../../services/api/apiClient.js';

export function ImportMedicinesModal({ open, onOpenChange, onSuccess }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Lightweight CSV parser (handles commas and quoted strings)
  const parseCsvText = (text) => {
    const lines = text.split(/\r\n|\n/).filter((line) => line.trim() && !line.trim().startsWith('#'));
    if (lines.length < 2) return [];

    const parseLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length >= 3) {
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        rows.push(rowObj);
      }
    }

    return rows;
  };

  const handleFileChange = (e) => {
    setErrorMsg('');
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrorMsg('Please select a valid .csv file');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const rows = parseCsvText(content);
        if (rows.length === 0) {
          setErrorMsg('No valid medicine rows detected in this CSV file.');
          setParsedRows([]);
        } else {
          setParsedRows(rows);
        }
      } catch (err) {
        setErrorMsg('Failed to parse CSV file: ' + err.message);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await apiClient.post('/medicines/import', { rows: parsedRows });
      const { created, updated, createdCategories, errors } = res.data;

      toast.success('Bulk Import Completed', {
        description: `Imported ${created} new, updated ${updated} medicines. (${createdCategories} categories created)`
      });

      if (errors && errors.length > 0) {
        toast.warning(`${errors.length} rows had errors and were skipped.`);
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Import failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedRows([]);
    setErrorMsg('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-surface bg-surface-card">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-text-primary">
            <FileSpreadsheet className="w-5 h-5 text-brand-primary" />
            Bulk Import Medicines from CSV
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Upload your filled medicine spreadsheet. New categories will be auto-created on the fly.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Area */}
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-surface hover:border-brand-primary/50 bg-surface-page/50 hover:bg-surface-muted/50 p-8 rounded-2xl text-center cursor-pointer transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Click to select CSV spreadsheet</p>
                <p className="text-xs text-text-muted mt-1">Supports standard CSV with UTF-8 encoding</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-card border border-surface">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-brand-primary" />
                  <div>
                    <p className="text-xs font-bold text-text-primary">{file.name}</p>
                    <p className="text-[11px] text-text-muted font-mono">{parsedRows.length} medicines parsed</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setParsedRows([]);
                  }}
                  className="p-1 text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Parsed Preview Table */}
              <div className="border border-surface rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-surface-muted/60 text-text-muted border-b border-surface">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Generic</th>
                      <th className="p-2">Primary Category</th>
                      <th className="p-2">SKU</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface text-text-primary">
                    {parsedRows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-surface-muted/30">
                        <td className="p-2 font-semibold truncate max-w-[120px]">{r['Medicine Name'] || r.name}</td>
                        <td className="p-2 text-text-muted truncate max-w-[120px]">{r['Generic Composition'] || r.genericName}</td>
                        <td className="p-2 text-brand-primary truncate max-w-[120px]">{r['Primary Category'] || r.category}</td>
                        <td className="p-2 font-mono">{r['SKU'] || r.sku}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <p className="text-[11px] text-text-muted text-center italic">
                  Showing first 10 of {parsedRows.length} rows...
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-surface bg-surface-card flex items-center justify-between sm:justify-between">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0 || isSubmitting}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold gap-1.5 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm &amp; Import ({parsedRows.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
