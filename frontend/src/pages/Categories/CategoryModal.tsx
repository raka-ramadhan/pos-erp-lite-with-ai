import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { useCreateCategory, useUpdateCategory, useActiveCategories } from '../../hooks/useCategories';
import { uploadFile } from '../../api/file.api';
import type { CategoryResponse } from '../../api/category.api';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  slug: z.string().max(100, 'Slug must be 100 characters or less').optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryResponse | null;
}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const isEditing = !!category;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const { data: categoriesResponse } = useActiveCategories();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const categories = categoriesResponse?.filter((c: CategoryResponse) => c.id !== category?.id) || [];
  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          slug: category.slug || '',
          description: category.description || '',
          parentId: category.parentId || '',
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        });
        setUploadedMediaId(category.mediaId);
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          parentId: '',
          sortOrder: 0,
          isActive: true,
        });
        setUploadedMediaId(null);
      }
      setSelectedFile(null);
    }
  }, [isOpen, category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      let mediaId = uploadedMediaId;

      // Upload file if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadResult = await uploadFile({
            file: selectedFile,
            entityType: 'categories',
            entityId: category?.id,
          });
          mediaId = uploadResult.id;
        } catch (error) {
          console.error('Failed to upload file:', error);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const payload: Record<string, unknown> = {
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive,
      };

      if (data.slug) {
        payload.slug = data.slug;
      }
      if (data.description) {
        payload.description = data.description;
      }
      if (data.parentId) {
        payload.parentId = data.parentId;
      }

      // Include mediaId (could be null to remove image, or new id, or existing id)
      if (isEditing) {
        // On update: mediaId=null means remove image, mediaId=new means upload and replace
        payload.mediaId = mediaId;
      } else {
        // On create: mediaId must be provided if image uploaded
        if (mediaId) {
          payload.mediaId = mediaId;
        }
      }

      if (isEditing && category) {
        updateCategory.mutate(
          { id: category.id, data: payload as any },
          { onSuccess: () => onClose() }
        );
      } else {
        createCategory.mutate(payload as any, {
          onSuccess: () => onClose(),
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleImageChange = (file: File | null) => {
    setSelectedFile(file);
    if (!file) {
      // User removed the image
      setUploadedMediaId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Category' : 'Create New Category'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <Input
              label="Name"
              placeholder="Enter category name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Slug (optional)"
              placeholder="auto-generated-from-name"
              error={errors.slug?.message}
              {...register('slug')}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Enter category description"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image
              </label>
              <ImageUpload
                value={category?.imageUrl || null}
                onChange={handleImageChange}
                onPreviewUrl={selectedFile ? undefined : category?.imageUrl || undefined}
                disabled={isUploading || isSubmitting}
              />
            </div>

            <Select
              label="Parent Category (optional)"
              options={[
                { value: '', label: 'No Parent (Root Category)' },
                ...categories.map((cat: CategoryResponse) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
              value={watch('parentId') || ''}
              onChange={(e) => setValue('parentId', e.target.value)}
            />

            <Input
              label="Sort Order"
              type="number"
              min={0}
              placeholder="0"
              {...register('sortOrder', { valueAsNumber: true })}
            />

            <Checkbox
              label="Active"
              checked={watch('isActive')}
              onChange={(e) => setValue('isActive', e.target.checked)}
            />

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting || isUploading}>
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
