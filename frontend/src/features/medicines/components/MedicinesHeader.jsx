import React, { useState } from 'react';
import { Pill, Plus, Download, Upload, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/button.jsx';
import { apiClient } from '../../../services/api/apiClient.js';
import { toast } from 'sonner';

export function MedicinesHeader({ onOpenAddModal, onOpenImportModal, canManageMedicines }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      setDropdownOpen(false);
      toast.info('Generating CSV template with active categories...');
      const res = await apiClient.get('/medicines/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pharmaflow_medicine_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded successfully');
    } catch (err) {
      toast.error('Failed to download template', { description: err.message });
    }
  };

  const handleExportCsv = async () => {
    try {
      setDropdownOpen(false);
      toast.info('Exporting current medicine catalog...');
      const res = await apiClient.get('/medicines/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pharmaflow_medicines_catalog.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Catalog exported successfully');
    } catch (err) {
      toast.error('Failed to export catalog', { description: err.message });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Medicines Master Catalogue
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Manage pharmaceutical formulations, therapeutic categories, strengths, and inventory thresholds.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* CSV Actions Dropdown */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="border-surface text-text-primary font-semibold gap-1.5 cursor-pointer text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-primary" />
            <span>CSV Tools</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </Button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-surface bg-surface-card p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors text-left cursor-pointer"
              >
                <Download className="w-4 h-4 text-brand-primary" />
                Download Template (.csv)
              </button>

              {canManageMedicines && (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenImportModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors text-left cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-brand-primary" />
                  Import from CSV
                </button>
              )}

              <div className="my-1 border-t border-surface" />

              <button
                type="button"
                onClick={handleExportCsv}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors text-left cursor-pointer"
              >
                <Download className="w-4 h-4 text-text-muted" />
                Export Full Catalog (.csv)
              </button>
            </div>
          )}
        </div>

        {canManageMedicines && (
          <Button
            onClick={onOpenAddModal}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold gap-2 shadow-sm cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </Button>
        )}
      </div>
    </div>
  );
}
