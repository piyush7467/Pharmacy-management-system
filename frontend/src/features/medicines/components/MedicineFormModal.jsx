import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  Tag,
  Package,
  Sliders,
  Sparkles,
  Barcode,
  Building,
  CheckCircle2,
  AlertCircle,
  Upload,
  Plus,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Badge } from '../../../components/ui/badge.jsx';
import {
  FormField,
  FormInput,
  FormSelect,
  TagInput,
  VerticalSectionNav,
  FormSectionHeader
} from '../../../components/ui/form-system.jsx';
import { toast } from 'sonner';

const DOSAGE_FORMS = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Cream / Ointment',
  'Drops',
  'Inhaler',
  'Chewable Tablet'
];

const PACKAGE_UNITS = [
  'Strip of 10',
  'Strip of 15',
  'Bottle of 100ml',
  'Bottle of 200ml',
  'Vial (Single Dose)',
  'Tube of 30g',
  'Box of 100',
  'Pack of 3'
];

const SECTIONS = [
  { id: 'basic', label: 'Basic Information', icon: Pill },
  { id: 'composition', label: 'Composition', icon: Sparkles },
  { id: 'classification', label: 'Classification', icon: Tag },
  { id: 'packaging', label: 'Packaging', icon: Package },
  { id: 'settings', label: 'Inventory Settings', icon: Sliders }
];

export function MedicineFormModal({
  open,
  onOpenChange,
  editingMedicine,
  categories = [],
  onSubmit,
  isSubmitting
}) {
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    categoryId: '',
    sku: '',
    dosageForm: 'Tablet',
    strength: '',
    packageUnit: 'Strip of 10',
    minReorderLevel: 20,
    defaultTaxRate: 12.0,
    manufacturer: '',
    therapeuticClasses: [],
    isActive: true
  });

  const handleAddTag = (tag) => {
    if (tag && !formData.therapeuticClasses.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        therapeuticClasses: [...prev.therapeuticClasses, tag]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      therapeuticClasses: prev.therapeuticClasses.filter((t) => t !== tagToRemove)
    }));
  };

  const generateSku = () => {
    const prefix = formData.name ? formData.name.slice(0, 3).toUpperCase() : 'MED';
    const rand = Math.floor(100000 + Math.random() * 900000);
    setFormData((prev) => ({ ...prev, sku: `${prefix}-${rand}` }));
  };

  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name || '',
        genericName: editingMedicine.genericName || '',
        categoryId: editingMedicine.categoryId || (categories[0]?.id || ''),
        sku: editingMedicine.sku || '',
        dosageForm: editingMedicine.dosageForm || 'Tablet',
        strength: editingMedicine.strength || '',
        packageUnit: editingMedicine.packageUnit || 'Strip of 10',
        minReorderLevel: editingMedicine.minReorderLevel || 20,
        defaultTaxRate: editingMedicine.defaultTaxRate !== undefined ? editingMedicine.defaultTaxRate : 12.0,
        manufacturer: editingMedicine.manufacturer || '',
        therapeuticClasses: Array.isArray(editingMedicine.therapeuticClasses) ? editingMedicine.therapeuticClasses : [],
        isActive: editingMedicine.isActive !== undefined ? editingMedicine.isActive : true
      });
    } else {
      setFormData({
        name: '',
        genericName: '',
        categoryId: categories[0]?.id || '',
        sku: `MED-${Math.floor(100000 + Math.random() * 900000)}`,
        dosageForm: 'Tablet',
        strength: '',
        packageUnit: 'Strip of 10',
        minReorderLevel: 20,
        defaultTaxRate: 12.0,
        manufacturer: '',
        therapeuticClasses: ['General'],
        isActive: true
      });
    }
  }, [editingMedicine, open, categories]);

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (!formData.name.trim()) {
      setActiveSection('basic');
      toast.error('Medicine brand name is required');
      return;
    }
    if (!formData.categoryId) {
      setActiveSection('classification');
      toast.error('Please select a therapeutic category');
      return;
    }
    if (!formData.sku.trim()) {
      setActiveSection('packaging');
      toast.error('SKU barcode is required');
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      genericName: formData.genericName.trim(),
      sku: formData.sku.trim().toUpperCase(),
      strength: formData.strength.trim() || 'Standard',
      packageUnit: formData.packageUnit.trim(),
      minReorderLevel: parseInt(formData.minReorderLevel, 10) || 20,
      defaultTaxRate: parseFloat(formData.defaultTaxRate) || 12.0
    };

    onSubmit(payload, () => {
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] p-0 gap-0 overflow-hidden bg-surface-card border-surface shadow-2xl rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface bg-surface-card shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 shadow-2xs">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                  {editingMedicine ? 'Edit Formulation' : 'Register New Medicine'}
                </h2>
                <Badge
                  variant="outline"
                  className="font-medium bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 px-2 py-0.5 text-xs rounded-md"
                >
                  Catalogue Item
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Add a new medicine to your catalogue with composition, classification and packaging details.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body with Left Navigation */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Left Vertical Section Nav */}
            <div className="p-4 border-r border-surface/70 bg-surface-page/50 shrink-0 hidden md:block">
              <VerticalSectionNav
                sections={SECTIONS}
                activeSection={activeSection}
                onSelectSection={setActiveSection}
              />
            </div>

            {/* Content Canvas */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SECTION: Basic Information */}
              {(activeSection === 'basic' || activeSection === 'composition') && (
                <div className="p-5 rounded-2xl border border-surface bg-surface-card shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-surface/60">
                    <FormSectionHeader
                      icon={Pill}
                      title="Basic Information"
                      subtitle="Trade name, generic chemical formulation and dosage form."
                      className="border-none pb-0 mb-0"
                    />

                    {/* Formulation Visual Pill Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/80 border border-primary/20 text-primary text-xs font-semibold">
                      <div className="w-5 h-2.5 rounded-full bg-primary/80 ring-1 ring-primary/40" />
                      <span>{formData.dosageForm || 'Tablet'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Brand / Trade Name" required helperText="Official commercial packaging name">
                      <FormInput
                        placeholder="e.g. Amoxil 500 or Augmentin 625"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        autoFocus
                      />
                    </FormField>

                    <FormField label="Generic Salt / Molecule" required helperText="Active pharmacological chemical composition">
                      <FormInput
                        leadingIcon={Search}
                        placeholder="e.g. Amoxicillin Trihydrate"
                        value={formData.genericName}
                        onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                        required
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <FormField label="Dosage Form" required>
                      <FormSelect
                        value={formData.dosageForm}
                        onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                      >
                        {DOSAGE_FORMS.map((df) => (
                          <option key={df} value={df}>
                            {df}
                          </option>
                        ))}
                      </FormSelect>
                    </FormField>

                    <FormField label="Strength" required helperText="Dose amount with standard unit">
                      <FormInput
                        placeholder="e.g. 500 mg, 10 ml, 250 mcg"
                        value={formData.strength}
                        onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                        required
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* SECTION: Composition & Manufacturer */}
              {(activeSection === 'composition' || activeSection === 'basic') && (
                <div className="p-5 rounded-2xl border border-surface bg-surface-card shadow-2xs space-y-4">
                  <FormSectionHeader
                    icon={Building}
                    title="Manufacturer & Pharma Company"
                    subtitle="Licensed pharmaceutical laboratory or marketing company."
                  />
                  <FormField label="Manufacturer / Brand Marketer" helperText="e.g. GSK Pharmaceuticals, Sun Pharma, Cipla Ltd.">
                    <FormInput
                      leadingIcon={Building}
                      placeholder="e.g. GlaxoSmithKline Pharmaceuticals Ltd."
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    />
                  </FormField>
                </div>
              )}

              {/* SECTION: Classification */}
              {(activeSection === 'classification' || activeSection === 'basic') && (
                <div className="p-5 rounded-2xl border border-surface bg-surface-card shadow-2xs space-y-4">
                  <FormSectionHeader
                    icon={Tag}
                    title="Classification & Therapeutics"
                    subtitle="Pharmacological category and multi-indication tags for clinical search."
                  />

                  <div className="space-y-4">
                    <FormField label="Primary Category" required helperText="Organizes medications in sales and catalogue lists">
                      <FormSelect
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                      >
                        <option value="">Select primary category...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </FormSelect>
                    </FormField>

                    <FormField
                      label="Therapeutic Classifications & Indications"
                      helperText="Press Enter or click Add to append multiple clinical classification tags"
                    >
                      <TagInput
                        tags={formData.therapeuticClasses}
                        onAddTag={handleAddTag}
                        onRemoveTag={handleRemoveTag}
                        placeholder="e.g. Antibiotic, Penicillin, Broad Spectrum..."
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* SECTION: Packaging & SKU */}
              {(activeSection === 'packaging' || activeSection === 'settings') && (
                <div className="p-5 rounded-2xl border border-surface bg-surface-card shadow-2xs space-y-4">
                  <FormSectionHeader
                    icon={Package}
                    title="Packaging & Barcode Identification"
                    subtitle="Dispensing unit format and barcode scanner identifier."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Package Unit" required>
                      <FormSelect
                        value={formData.packageUnit}
                        onChange={(e) => setFormData({ ...formData, packageUnit: e.target.value })}
                      >
                        {PACKAGE_UNITS.map((pu) => (
                          <option key={pu} value={pu}>
                            {pu}
                          </option>
                        ))}
                      </FormSelect>
                    </FormField>

                    <FormField label="SKU / Barcode" required helperText="Unique barcode for POS scanner">
                      <div className="flex items-center gap-2">
                        <FormInput
                          leadingIcon={Barcode}
                          placeholder="e.g. MED-847649"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                          required
                          className="font-mono uppercase font-bold text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generateSku}
                          className="h-[46px] px-3 border-surface text-text-muted hover:text-text-primary rounded-xl cursor-pointer"
                          title="Generate Random SKU"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </FormField>
                  </div>
                </div>
              )}

              {/* SECTION: Inventory Settings */}
              {(activeSection === 'settings' || activeSection === 'packaging') && (
                <div className="p-5 rounded-2xl border border-surface bg-surface-card shadow-2xs space-y-4">
                  <FormSectionHeader
                    icon={Sliders}
                    title="Catalogue Settings & Taxes"
                    subtitle="Stock alerts and GST tax computation settings."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Min Reorder Level (Units)" helperText="Triggers low stock badge on dashboard">
                      <FormInput
                        type="number"
                        min="0"
                        value={formData.minReorderLevel}
                        onChange={(e) => setFormData({ ...formData, minReorderLevel: e.target.value })}
                      />
                    </FormField>

                    <FormField label="Default Tax Rate (% GST)" helperText="Standard pharmaceutical GST is 12%">
                      <FormInput
                        type="number"
                        min="0"
                        max="28"
                        step="0.5"
                        trailing="%"
                        value={formData.defaultTaxRate}
                        onChange={(e) => setFormData({ ...formData, defaultTaxRate: e.target.value })}
                      />
                    </FormField>
                  </div>

                  <div className="pt-2 border-t border-surface flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-text-primary block">
                        Formulation Active Status
                      </span>
                      <span className="text-xs text-text-muted">
                        Inactive medicines are hidden from POS billing and new purchase orders.
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-surface bg-surface-card shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-10 px-5 text-sm font-medium rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm gap-2 cursor-pointer"
            >
              <Pill className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving Formulation...'
                  : editingMedicine
                  ? 'Update Formulation'
                  : 'Register Medicine'}
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
