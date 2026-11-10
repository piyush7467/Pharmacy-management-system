import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  RefreshCw,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import {
  FormField,
  FormInput,
  FormSelect,
  TagInput,
  FormSectionHeader
} from '../../components/ui/form-system.jsx';
import { apiClient } from '../../services/api/apiClient.js';
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

export function MedicineFormView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();

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

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categoriesList'],
    queryFn: async () => {
      const res = await apiClient.get('/categories?limit=100');
      return res.data?.categories || res.data || res || [];
    }
  });

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.categories || categoriesData?.data || []);

  // Fetch Medicine if in Edit Mode
  const { data: existingMedicine, isLoading: loadingExisting } = useQuery({
    queryKey: ['medicine', id],
    queryFn: async () => {
      const res = await apiClient.get(`/medicines/${id}`);
      return res.data?.medicine || res.data || res;
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (existingMedicine) {
      setFormData({
        name: existingMedicine.name || '',
        genericName: existingMedicine.genericName || '',
        categoryId: existingMedicine.categoryId || '',
        sku: existingMedicine.sku || '',
        dosageForm: existingMedicine.dosageForm || 'Tablet',
        strength: existingMedicine.strength || '',
        packageUnit: existingMedicine.packageUnit || 'Strip of 10',
        minReorderLevel: existingMedicine.minReorderLevel ?? 20,
        defaultTaxRate: existingMedicine.defaultTaxRate ?? 12.0,
        manufacturer: existingMedicine.manufacturer || '',
        therapeuticClasses: existingMedicine.therapeuticClasses || [],
        isActive: existingMedicine.isActive ?? true
      });
    } else if (!isEditing) {
      // Auto-assign random SKU for new registrations
      setFormData((prev) => ({
        ...prev,
        sku: `MED-${Math.floor(100000 + Math.random() * 900000)}`
      }));
    }
  }, [existingMedicine, isEditing]);

  const saveMutation = useMutation({
    mutationFn: (medData) => {
      if (isEditing) {
        return apiClient.patch(`/medicines/${id}`, medData);
      }
      return apiClient.post('/medicines', medData);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Medicine updated successfully' : 'Medicine registered successfully');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['pos-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-overview'] });
      navigate('/medicines');
    },
    onError: (err) => {
      toast.error(err?.message || err?.response?.data?.message || 'Failed to save medicine');
    }
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

  const handleRegenerateSku = () => {
    setFormData((prev) => ({
      ...prev,
      sku: `MED-${Math.floor(100000 + Math.random() * 900000)}`
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Brand / Trade Name is required');
      return;
    }
    if (!formData.genericName.trim()) {
      toast.error('Generic Salt / Molecule name is required');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select a Primary Category');
      return;
    }
    if (!formData.sku.trim()) {
      toast.error('SKU / Barcode is required');
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      genericName: formData.genericName.trim(),
      sku: formData.sku.trim(),
      minReorderLevel: parseInt(formData.minReorderLevel, 10) || 0,
      defaultTaxRate: parseFloat(formData.defaultTaxRate) || 0,
      manufacturer: formData.manufacturer?.trim() || null
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/medicines"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-surface-card"
        >
          <ArrowLeft className="h-4 w-4 text-brand-primary" />
          <span>Back to Medicine Catalog</span>
        </Link>

        <Badge
          variant="outline"
          className={
            formData.isActive
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20'
          }
        >
          {formData.isActive ? 'Active Formulary' : 'Inactive / Delisted'}
        </Badge>
      </div>

      {/* 2. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary shrink-0 shadow-2xs">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {isEditing ? 'Edit Medicine Formulation' : 'Register New Medicine'}
            </h1>
            <p className="text-sm text-text-muted">
              Add a new medicine to your catalogue with composition, classification and packaging details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/medicines')}
            className="border-surface hover:bg-surface-card"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saveMutation.isPending || loadingExisting}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold px-5 shadow-sm"
          >
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Medicine' : 'Register Medicine'}
          </Button>
        </div>
      </div>

      {/* 3. Form Cards */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Information + Visual Asset Card */}
        <div className="rounded-xl border border-surface bg-surface-card p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface">
            <Pill className="h-5 w-5 text-brand-primary" />
            <h2 className="text-base font-semibold text-text-primary">1. Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Fields (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Brand / Trade Name" required helper="e.g. Amoxil 500, Augmentin 625 Duo">
                  <FormInput
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Amoxil 500"
                    autoFocus
                  />
                </FormField>

                <FormField label="Generic Salt / Molecule" required helper="Active pharmaceutical ingredient">
                  <FormInput
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    placeholder="e.g. Amoxicillin Trihydrate"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Dosage Form" required>
                  <FormSelect
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                  >
                    {DOSAGE_FORMS.map((form) => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </FormSelect>
                </FormField>

                <FormField label="Strength / Concentration" helper="e.g. 500 mg, 625 mg, 5 mg/5ml">
                  <FormInput
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g. 500 mg"
                  />
                </FormField>
              </div>

              <FormField label="Manufacturer / Pharmaceutical Lab" helper="Primary producer or marketing entity">
                <FormInput
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="e.g. GlaxoSmithKline Pharmaceuticals"
                />
              </FormField>
            </div>

            {/* Visual Capsule Illustration (4 cols) matching reference image */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-brand-primary/30 bg-brand-primary/5 text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-xs">
                <Pill className="h-10 w-10 rotate-45" />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">Packaging Asset</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Visual pill badge for checkout & catalog recognition
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10 gap-1.5"
                onClick={() => toast.info('Default packaging glyph assigned for this formulation.')}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Image
              </Button>
            </div>
          </div>
        </div>

        {/* Card 2: Classification */}
        <div className="rounded-xl border border-surface bg-surface-card p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface">
            <Tag className="h-5 w-5 text-brand-primary" />
            <h2 className="text-base font-semibold text-text-primary">2. Classification & Therapeutic Class</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <FormField label="Primary Category" required helper="Defines shelf organization and analytics">
              <FormSelect
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Select therapeutic category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="Therapeutic Classifications" helper="Type tag and press Enter to attach multiple tags">
              <TagInput
                tags={formData.therapeuticClasses}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                placeholder="Type tag (e.g. Antibiotics, Penicillin)..."
              />
            </FormField>
          </div>
        </div>

        {/* Card 3: Packaging & Identification */}
        <div className="rounded-xl border border-surface bg-surface-card p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface">
            <Package className="h-5 w-5 text-brand-primary" />
            <h2 className="text-base font-semibold text-text-primary">3. Packaging & Barcode</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Package Unit" required>
              <FormSelect
                value={formData.packageUnit}
                onChange={(e) => setFormData({ ...formData, packageUnit: e.target.value })}
              >
                {PACKAGE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="Pack Size (Units/Strip)" helper="Number of pills or doses per saleable unit">
              <FormInput
                type="number"
                min="1"
                value="10"
                readOnly
                className="bg-surface/40"
              />
            </FormField>

            <FormField label="SKU / Barcode" required helper="Unique product code for POS scanning">
              <div className="relative flex items-center">
                <FormInput
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. MED-847649"
                  className="font-mono pr-9"
                />
                <button
                  type="button"
                  onClick={handleRegenerateSku}
                  title="Generate new SKU"
                  className="absolute right-2.5 text-text-muted hover:text-text-primary p-1 rounded transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </FormField>
          </div>
        </div>

        {/* Card 4: Inventory & Commercial Settings */}
        <div className="rounded-xl border border-surface bg-surface-card p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface">
            <Sliders className="h-5 w-5 text-brand-primary" />
            <h2 className="text-base font-semibold text-text-primary">4. Inventory & Commercial Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Minimum Reorder Level (Units)" helper="Triggers stock alert when below threshold">
              <FormInput
                type="number"
                min="0"
                value={formData.minReorderLevel}
                onChange={(e) => setFormData({ ...formData, minReorderLevel: e.target.value })}
              />
            </FormField>

            <FormField label="Default Tax Rate (%)" helper="GST / VAT rate applied to retail sales">
              <FormInput
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.defaultTaxRate}
                onChange={(e) => setFormData({ ...formData, defaultTaxRate: e.target.value })}
              />
            </FormField>

            <FormField label="Formulary Status" helper="Active medicines appear in POS search">
              <div className="flex items-center h-10 px-3 rounded-lg border border-surface bg-surface/30">
                <label className="flex items-center gap-2 text-sm font-medium text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-surface text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Active in Formulary & POS</span>
                </label>
              </div>
            </FormField>
          </div>
        </div>

        {/* 4. Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/medicines')}
            className="border-surface hover:bg-surface-card"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending || loadingExisting}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold px-6 shadow-sm"
          >
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Medicine' : 'Register Medicine'}
          </Button>
        </div>
      </form>
    </div>
  );
}
