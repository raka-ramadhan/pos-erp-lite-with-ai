import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { useCreateProduct, useCreateProductWithImage, useUpdateProduct, useActiveCategories } from '../../hooks';
import { uploadFile } from '../../api/file.api';
import type { ProductResponse, Tax, ModifierGroup } from '../../api/product.api';
import taxApi from '../../api/tax.api';
import modifierGroupApi from '../../api/modifier-group.api';

interface FormData {
  name: string;
  sku: string;
  slug: string;
  description: string;
  categoryId: string;
  price: number;
  costPrice: number | undefined;
  unitType: string;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number | undefined;
  sortOrder: number;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  categoryId?: string;
  price?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductResponse | null;
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const createProductWithImage = useCreateProductWithImage();
  const updateProduct = useUpdateProduct();
  const { data: categoriesResponse } = useActiveCategories();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku: '',
    slug: '',
    description: '',
    categoryId: '',
    price: 0,
    costPrice: undefined,
    unitType: 'unit',
    isAvailable: true,
    isFeatured: false,
    preparationTime: undefined,
    sortOrder: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>([]);
  const [selectedModifierGroupIds, setSelectedModifierGroupIds] = useState<string[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const categories = categoriesResponse || [];
  const isSubmitting = createProduct.isPending || updateProduct.isPending || createProductWithImage.isPending;

  // Load taxes and modifier groups
  useEffect(() => {
    if (isOpen) {
      loadTaxes();
      loadModifierGroups();
    }
  }, [isOpen]);

  const loadTaxes = async () => {
    try {
      const data = await taxApi.getAllActive();
      setTaxes(data);
    } catch (error) {
      console.error('Failed to load taxes:', error);
    }
  };

  const loadModifierGroups = async () => {
    try {
      setLoadingRefs(true);
      // getAllActive returns modifier groups with modifiers count
      const data = await modifierGroupApi.getAllActive();
      setModifierGroups(data);
    } catch (error) {
      console.error('Failed to load modifier groups:', error);
    } finally {
      setLoadingRefs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name,
          sku: product.sku || '',
          slug: product.slug || '',
          description: product.description || '',
          categoryId: product.categoryId,
          price: product.price,
          costPrice: product.costPrice || undefined,
          unitType: product.unitType,
          isAvailable: product.isAvailable,
          isFeatured: product.isFeatured,
          preparationTime: product.preparationTime || undefined,
          sortOrder: product.sortOrder,
          isActive: product.isActive,
        });
        setUploadedMediaId(product.mediaId);
        setSelectedTaxIds(product.taxes?.map((t) => t.id) || []);
        setSelectedModifierGroupIds(product.modifierGroups?.map((mg) => mg.id) || []);
      } else {
        setFormData({
          name: '',
          sku: '',
          slug: '',
          description: '',
          categoryId: '',
          price: 0,
          costPrice: undefined,
          unitType: 'unit',
          isAvailable: true,
          isFeatured: false,
          preparationTime: undefined,
          sortOrder: 0,
          isActive: true,
        });
        setUploadedMediaId(null);
        setSelectedTaxIds([]);
        setSelectedModifierGroupIds([]);
      }
      setSelectedFile(null);
      setErrors({});
    }
  }, [isOpen, product]);

  const handleChange = (field: keyof FormData, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (file: File | null) => {
    setSelectedFile(file);
    if (!file) {
      setUploadedMediaId(null);
    }
  };

  const handleTaxChange = (taxId: string) => {
    setSelectedTaxIds((prev) =>
      prev.includes(taxId)
        ? prev.filter((id) => id !== taxId)
        : [...prev, taxId]
    );
  };

  const handleModifierGroupChange = (mgId: string) => {
    setSelectedModifierGroupIds((prev) =>
      prev.includes(mgId)
        ? prev.filter((id) => id !== mgId)
        : [...prev, mgId]
    );
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (formData.price < 0) {
      newErrors.price = 'Price must be 0 or greater';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    // Build base payload
    const basePayload = {
      name: formData.name,
      categoryId: formData.categoryId,
      price: formData.price,
      unitType: formData.unitType || 'unit',
      isAvailable: formData.isAvailable,
      isFeatured: formData.isFeatured,
      sortOrder: formData.sortOrder ?? 0,
      isActive: formData.isActive,
      taxIds: selectedTaxIds,
      modifierGroupIds: selectedModifierGroupIds,
      ...(formData.sku && { sku: formData.sku }),
      ...(formData.slug && { slug: formData.slug }),
      ...(formData.description && { description: formData.description }),
      ...(formData.costPrice !== undefined && { costPrice: formData.costPrice }),
      ...(formData.preparationTime !== undefined && { preparationTime: formData.preparationTime }),
    };

    try {
      if (isEditing) {
        // For update: if new image selected, upload first then update with mediaId
        let mediaId = uploadedMediaId;

        if (selectedFile) {
          setIsUploading(true);
          try {
            const uploadResult = await uploadFile({
              file: selectedFile,
              entityType: 'products',
              entityId: product.id,
            });
            mediaId = uploadResult.id;
          } catch (error) {
            console.error('Failed to upload file:', error);
            setIsUploading(false);
            return;
          }
          setIsUploading(false);
        }

        const updatePayload = {
          ...basePayload,
          ...(mediaId && { mediaId }),
        };
        updateProduct.mutate(
          { id: product.id, data: updatePayload },
          { onSuccess: () => onClose() }
        );
      } else {
        // For create: use special endpoint that handles image upload in one request
        if (selectedFile) {
          createProductWithImage.mutate(
            { data: basePayload, imageFile: selectedFile },
            { onSuccess: () => onClose() }
          );
        } else {
          // No image - use regular create
          createProduct.mutate(basePayload, {
            onSuccess: () => onClose(),
          });
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Product' : 'Create New Product'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* General Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                General Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Product Image
                  </label>
                  <ImageUpload
                    value={product?.imageUrl || null}
                    onChange={handleImageChange}
                    onPreviewUrl={selectedFile ? undefined : product?.imageUrl || undefined}
                    disabled={isUploading || isSubmitting}
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    label="Product Name *"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={errors.name}
                  />
                </div>

                <Input
                  label="SKU / Code"
                  placeholder="e.g., PR001"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                />

                <Input
                  label="Barcode"
                  placeholder="Barcode number (optional)"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                />

                <Select
                  label="Category *"
                  options={[
                    { value: '', label: 'Select Category' },
                    ...categories.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    })),
                  ]}
                  value={formData.categoryId}
                  onChange={(e) => handleChange('categoryId', e.target.value)}
                  error={errors.categoryId}
                />

                <Input
                  label="Unit Type"
                  placeholder="unit"
                  value={formData.unitType}
                  onChange={(e) => handleChange('unitType', e.target.value)}
                />

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Pricing
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Selling Price *"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  error={errors.price}
                />

                <Input
                  label="Cost Price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={formData.costPrice ?? ''}
                  onChange={(e) => handleChange('costPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Tax Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Tax
              </h3>

              {loadingRefs ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading taxes...
                </div>
              ) : taxes.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {taxes.map((tax) => (
                    <label
                      key={tax.id}
                      className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTaxIds.includes(tax.id)}
                        onChange={() => handleTaxChange(tax.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{tax.name}</p>
                        <p className="text-xs text-slate-500">
                          {tax.taxType === 'percentage' ? `${tax.rate}%` : `Rp ${tax.rate.toLocaleString()}`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No taxes available</p>
              )}
            </div>

            {/* Modifier Groups */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Modifier Groups
              </h3>

              {loadingRefs ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading modifier groups...
                </div>
              ) : modifierGroups.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {modifierGroups.map((mg) => (
                    <label
                      key={mg.id}
                      className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 border border-transparent hover:border-indigo-200 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedModifierGroupIds.includes(mg.id)}
                        onChange={() => handleModifierGroupChange(mg.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{mg.name}</p>
                        <p className="text-xs text-slate-500">
                          {mg.selectionType === 'single' ? 'Single choice' : 'Multiple choice'}
                          {mg.isRequired && ' • Required'}
                        </p>
                        {'modifierCount' in mg && mg.modifierCount !== undefined && (
                          <p className="text-xs text-indigo-600 font-medium">
                            {mg.modifierCount} option{mg.modifierCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No modifier groups available</p>
              )}
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Availability
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Checkbox
                  label="Active"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />

                <Checkbox
                  label="Available (In Stock)"
                  checked={formData.isAvailable}
                  onChange={(e) => handleChange('isAvailable', e.target.checked)}
                />

                <Checkbox
                  label="Featured Product"
                  checked={formData.isFeatured}
                  onChange={(e) => handleChange('isFeatured', e.target.checked)}
                />
              </div>

              <Input
                label="Sort Order"
                type="number"
                min={0}
                placeholder="0"
                value={formData.sortOrder}
                onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
              />

              <Input
                label="Preparation Time (minutes)"
                type="number"
                min={0}
                placeholder="Optional"
                value={formData.preparationTime ?? ''}
                onChange={(e) => handleChange('preparationTime', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={onSubmit} isLoading={isSubmitting || isUploading}>
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
