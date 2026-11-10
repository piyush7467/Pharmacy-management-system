import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  Download,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Table,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import { apiClient } from '../../../services/api/apiClient.js';

export function ImportMedicinesModal({ open, onOpenChange, onSuccess }) {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1); // 1: Upload | 2: Preview | 3: Confirm
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetState = () => {
    setStep(1);
    setFile(null);
    setParsedRows([]);
    setErrorMsg('');
  };

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
      setErrorMsg('Please select a valid .csv spreadsheet file');
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
          setStep(2); // Auto advance to preview
        }
      } catch (err) {
        setErrorMsg('Failed to parse CSV file: ' + err.message);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDownloadTemplate = async () => {
    try {
      toast.info('Downloading medicine CSV template...');
      const res = await apiClient.get('/medicines/template', { responseType: 'blob' });
      const blob = res instanceof Blob ? res : new Blob([res], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pharmapulse_medicine_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      toast.success('Template downloaded');
    } catch (err) {
      toast.error('Failed to download template', { description: err.message });
    }
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await apiClient.post('/medicines/import', { rows: parsedRows });
      const summary = res.data || res;
      const { created = 0, updated = 0, createdCategories = 0, errors = [] } = summary;

      toast.success('Bulk Import Completed Successfully', {
        description: `Imported ${created} new, updated ${updated} medicines. (${createdCategories} categories created)`
      });

      if (errors && errors.length > 0) {
        toast.warning(`${errors.length} rows had errors and were skipped.`);
      }

      onSuccess();
      resetState();
      onOpenChange(false);
    } catch (err) {
      setErrorMsg(err.message || err.response?.data?.error?.message || 'Import failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample categories in parsed rows
  const uniqueCategories = [
    ...new Set(
      parsedRows
        .map((r) => r['Primary Category'] || r.category || r.categoryName)
        .filter(Boolean)
    )
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetState();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-3xl w-[95vw] max-h-[92vh] p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                  Bulk Import Medicines
                </h2>
                <Badge
                  variant="outline"
                  className="font-mono text-xs bg-secondary text-primary border-primary/20 px-2 py-0.5"
                >
                  Step {step} of 3
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Upload CSV spreadsheets to rapidly seed or update your pharmaceutical master catalogue.
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="px-6 py-2.5 border-b border-surface/70 bg-surface-page/60 flex items-center justify-between text-xs font-semibold text-text-muted">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-primary' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-surface-muted text-text-muted'}`}>
              1
            </span>
            <span>Upload File</span>
          </div>
          <div className="w-12 h-px bg-surface" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-primary' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-surface-muted text-text-muted'}`}>
              2
            </span>
            <span>Preview & Validate</span>
          </div>
          <div className="w-12 h-px bg-surface" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-primary' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-surface-muted text-text-muted'}`}>
              3
            </span>
            <span>Confirm Import</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Upload Dropzone */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-surface hover:border-primary/50 bg-surface-page/40 hover:bg-secondary/20 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary text-primary mx-auto flex items-center justify-center shadow-2xs">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">
                    Click to select or drag and drop a .csv file
                  </h4>
                  <p className="text-xs text-text-muted mt-1">
                    Standard UTF-8 CSV with columns: Medicine Name, Generic Composition, Primary Category, SKU...
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Sample Template Callout */}
              <div className="p-4 rounded-xl border border-surface bg-surface-card flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-text-primary block">
                    Need the pre-formatted import spreadsheet?
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Contains headers and valid categories pre-populated from your live database.
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="h-8 text-xs font-semibold text-primary border-primary/30 hover:bg-secondary gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Preview & Validation Table */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-text-primary block">
                    Spreadsheet Inspection: {file?.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    Found <strong className="text-primary font-mono">{parsedRows.length} valid medicine records</strong> ready for ingestion.
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setParsedRows([]);
                    setStep(1);
                  }}
                  className="h-7 text-xs text-text-muted hover:text-red-600"
                >
                  Choose Different File
                </Button>
              </div>

              {/* Unique Categories Pill List */}
              {uniqueCategories.length > 0 && (
                <div className="p-3 rounded-xl border border-surface bg-surface-page space-y-1.5 text-xs">
                  <span className="font-semibold text-text-muted text-[11px] uppercase tracking-wider block">
                    Detected Categories ({uniqueCategories.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueCategories.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-secondary text-primary border border-primary/20"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Table of First 5 rows */}
              <div className="overflow-x-auto rounded-xl border border-surface max-h-56">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-page text-text-muted font-semibold uppercase text-[10px] border-b border-surface sticky top-0">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Medicine Name</th>
                      <th className="py-2 px-3">Generic Composition</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Dosage / Pack</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-page/50">
                        <td className="py-2 px-3 font-mono text-text-muted">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-text-primary">
                          {row['Medicine Name'] || row.name}
                        </td>
                        <td className="py-2 px-3 text-text-muted">
                          {row['Generic Composition'] || row.genericName}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-surface-page border border-surface text-[10px] font-semibold">
                            {row['Primary Category'] || row.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-text-primary">
                          {row['SKU'] || row.sku}
                        </td>
                        <td className="py-2 px-3 text-text-muted">
                          {row['Dosage Form'] || 'Tablet'} • {row['Package Unit'] || 'Pack'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 5 && (
                <p className="text-[11px] text-text-muted text-center italic">
                  + {parsedRows.length - 5} additional records will be processed.
                </p>
              )}
            </div>
          )}

          {/* STEP 3: Final Review & Confirmation */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl border border-surface bg-secondary/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-secondary text-primary mx-auto flex items-center justify-center shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    Ready to Ingest {parsedRows.length} Medications
                  </h3>
                  <p className="text-xs text-text-muted max-w-md mx-auto mt-1">
                    Existing medicines with matching barcodes or names will be updated. Brand-new categories and formulations will be registered automatically.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3.5 rounded-xl border border-surface bg-surface-card">
                  <span className="text-text-muted block font-medium">Total Rows</span>
                  <span className="text-base font-black font-mono text-text-primary mt-0.5 block">
                    {parsedRows.length}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-surface bg-surface-card">
                  <span className="text-text-muted block font-medium">Categories</span>
                  <span className="text-base font-black font-mono text-primary mt-0.5 block">
                    {uniqueCategories.length}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-surface bg-surface-card">
                  <span className="text-text-muted block font-medium">Format</span>
                  <span className="text-base font-black font-mono text-text-primary mt-0.5 block">
                    CSV / UTF-8
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-surface bg-surface-card shrink-0">
          <div>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={isSubmitting}
                className="h-10 px-4 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-10 px-5 text-sm font-medium rounded-xl cursor-pointer"
            >
              Cancel
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                disabled={parsedRows.length === 0}
                className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleConfirmImport}
                disabled={isSubmitting}
                className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing Catalogue...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Execute Bulk Intake</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
