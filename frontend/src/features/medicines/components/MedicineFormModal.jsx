import React, { useState, useEffect } from 'react';
import { Pill, Loader2, Plus, Edit2, X, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../components/ui/dialog.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Label } from '../../../components/ui/label.jsx';
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

export function MedicineFormModal({
  open,
  onOpenChange,
  editingMedicine,
  categories = [],
  onSubmit,
  isSubmitting
}) {
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

  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e) => {
    e?.preventDefault();
    const tag = tagInput.trim();
    if (tag && !formData.therapeuticClasses.includes(tag)) {
      setFormData({
        ...formData,
        therapeuticClasses: [...formData.therapeuticClasses, tag]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      therapeuticClasses: formData.therapeuticClasses.filter((t) => t !== tagToRemove)
    });
  };

  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name || '',
        genericName: editingMedicine.genericName || '',
        categoryId: editingMedicine.categoryId || '',
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
        sku: `MED-${Date.now().toString().slice(-6)}`,
        dosageForm: 'Tablet',
        strength: '',
        packageUnit: 'Strip of 10',
        minReorderLevel: 20,
        defaultTaxRate: 12.0,
        manufacturer: '',
        therapeuticClasses: [],
        isActive: true
      });
    }
  }, [editingMedicine, open, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Medicine brand name is required');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select a therapeutic category');
      return;
    }
    if (!formData.sku.trim()) {
      toast.error('SKU barcode is required');
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      genericName: formData.genericName.trim(),
      sku: formData.sku.trim().toUpperCase(),
      strength: formData.strength.trim(),
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
      <DialogContent className="max-w-2xl bg-surface-card border-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-text-primary flex items-center gap-2">
            <Pill className="w-5 h-5 text-brand-primary" />
            <span>{editingMedicine ? 'Edit Drug Formulation' : 'Register New Medicine Formulation'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Configure pharmaceutical master records, chemical salts, and inventory reorder thresholds.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Brand / Trade Name *
              </Label>
              <Input
                placeholder="e.g. Amoxicillin Trihydrate"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-surface-page border-surface font-bold text-sm rounded-xl"
                required
              />
            </div>

            {/* Generic Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Generic Salt / Molecule
              </Label>
              <Input
                placeholder="e.g. Amoxicillin"
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                className="bg-surface-page border-surface text-sm rounded-xl"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Therapeutic Category *
              </Label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full h-10 px-3 text-sm bg-surface-page border border-surface rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                SKU / Barcode *
              </Label>
              <Input
                placeholder="e.g. AMX-250-CAP"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="bg-surface-page border-surface font-mono font-bold text-sm uppercase rounded-xl"
                required
              />
            </div>

            {/* Dosage Form */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Dosage Form *
              </Label>
              <select
                value={formData.dosageForm}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                className="w-full h-10 px-3 text-sm bg-surface-page border border-surface rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {DOSAGE_FORMS.map((form) => (
                  <option key={form} value={form}>
                    {form}
                  </option>
                ))}
              </select>
            </div>

            {/* Strength */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Potency / Strength
              </Label>
              <Input
                placeholder="e.g. 500mg, 10mg/5ml"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                className="bg-surface-page border-surface text-sm rounded-xl"
              />
            </div>

            {/* Package Unit */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Package Unit Description
              </Label>
              <Input
                placeholder="e.g. Strip of 10, Bottle of 100ml"
                value={formData.packageUnit}
                onChange={(e) => setFormData({ ...formData, packageUnit: e.target.value })}
                className="bg-surface-page border-surface text-sm rounded-xl"
              />
            </div>

            {/* Manufacturer */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Pharmaceutical Manufacturer
              </Label>
              <Input
                placeholder="e.g. Micro Labs Ltd, GSK, Cipla"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="bg-surface-page border-surface text-sm rounded-xl"
              />
            </div>

            {/* Min Reorder Level */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Minimum Reorder Threshold (Units)
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.minReorderLevel}
                onChange={(e) => setFormData({ ...formData, minReorderLevel: e.target.value })}
                className="bg-surface-page border-surface font-mono font-bold text-sm rounded-xl"
              />
            </div>
          </div>

          {/* Secondary Therapeutic Indications (Tags) */}
          <div className="space-y-2 pt-2 border-t border-surface">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-primary" />
                Secondary Therapeutic Indications / Uses
              </Label>
              <span className="text-[11px] text-text-muted">Type tag and press Enter</span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="e.g. Pain Relief, Fever, Antiplatelet..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="bg-surface-page border-surface text-xs rounded-xl"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                className="shrink-0 text-xs font-bold cursor-pointer"
              >
                + Add
              </Button>
            </div>

            {/* Tag Badges list */}
            {formData.therapeuticClasses.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.therapeuticClasses.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-surface font-bold cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  {editingMedicine ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingMedicine ? 'Update Formulation' : 'Register Medicine'}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
