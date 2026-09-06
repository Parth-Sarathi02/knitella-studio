'use client';

import { useState, useRef, useEffect } from 'react';
import { FolderUp, X, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';

interface BulkItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  price: string;
  categoryId: string;
  featured: boolean;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

interface BulkUploadModalProps {
  categories: Category[];
  onClose: () => void;
  onDone: () => void;
}

function humanizeFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  return withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function BulkUploadModal({ categories, onClose, onDone }: BulkUploadModalProps) {
  const [items, setItems] = useState<BulkItem[]>([]);
  const [bulkCategoryId, setBulkCategoryId] = useState(categories[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  // webkitdirectory isn't part of React's typed input props, so it's set imperatively.
  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const imageFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    const newItems: BulkItem[] = imageFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: humanizeFileName(file.name),
      price: '',
      categoryId: bulkCategoryId,
      featured: false,
      status: 'pending',
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, patch: Partial<BulkItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const applyCategoryToAll = (categoryId: string) => {
    setBulkCategoryId(categoryId);
    setItems((prev) => prev.map((i) => ({ ...i, categoryId })));
  };

  const readyToSubmit = items.length > 0 && items.every((i) => i.name.trim() && i.price.trim() && i.categoryId);

  const handleSubmit = async () => {
    setSubmitting(true);

    for (const item of items) {
      if (item.status === 'done') continue;
      updateItem(item.id, { status: 'uploading' });

      try {
        const ext = item.file.name.split('.').pop() || 'jpg';
        const path = `${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, item.file, { upsert: false });
        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);

        const { error: insertError } = await supabase.from('products').insert({
          name: item.name,
          description: '',
          price: parseFloat(item.price) || 0,
          image_url: urlData.publicUrl,
          category_id: item.categoryId,
          featured: item.featured,
          active: true,
          sort_order: 0,
        });
        if (insertError) throw new Error(insertError.message);

        updateItem(item.id, { status: 'done' });
      } catch (err) {
        updateItem(item.id, {
          status: 'error',
          errorMsg: err instanceof Error ? err.message : 'Upload failed',
        });
      }
    }

    setSubmitting(false);
  };

  const allDone = items.length > 0 && items.every((i) => i.status === 'done');
  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-sm" onClick={submitting ? undefined : onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-4xl bg-cream-50 shadow-float">
        <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-rose-900">Bulk Upload from Folder</h2>
            <p className="text-xs text-rose-500/70">Select a folder of product photos to upload and create products all at once.</p>
          </div>
          <button
            onClick={submitting ? undefined : onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-rose-400 transition-colors hover:bg-rose-100 disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-cream-300 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <FolderUp className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display font-semibold text-rose-900">Choose a folder of images</p>
                <p className="mt-1 text-sm text-rose-500/70">Every image inside will be added below for you to review.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => folderInputRef.current?.click()} className="btn-primary">
                  Select Folder
                </button>
                <button onClick={() => filesInputRef.current?.click()} className="btn-secondary">
                  Select Files Instead
                </button>
              </div>
              <input
                ref={folderInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <input
                ref={filesInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-white p-4 shadow-soft">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-rose-400">
                    Apply category to all {items.length} images
                  </label>
                  <select
                    value={bulkCategoryId}
                    onChange={(e) => applyCategoryToAll(e.target.value)}
                    disabled={submitting}
                    className="input-field w-56"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => (folderInputRef.current ?? filesInputRef.current)?.click()}
                  disabled={submitting}
                  className="btn-ghost text-sm"
                >
                  + Add more images
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-cream-100">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a remote asset */}
                      <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
                      {item.status === 'uploading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      )}
                      {item.status === 'done' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-sage-900/40">
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                      )}
                      {item.status === 'error' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-rose-900/50">
                          <AlertCircle className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                        disabled={submitting}
                        className="input-field !py-1.5 text-sm"
                        placeholder="Product name"
                      />
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, { price: e.target.value })}
                          disabled={submitting}
                          className="input-field !py-1.5 text-sm"
                          placeholder="Price (₹)"
                        />
                        <select
                          value={item.categoryId}
                          onChange={(e) => updateItem(item.id, { categoryId: e.target.value })}
                          disabled={submitting}
                          className="input-field !py-1.5 text-sm"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs text-rose-700">
                          <input
                            type="checkbox"
                            checked={item.featured}
                            onChange={(e) => updateItem(item.id, { featured: e.target.checked })}
                            disabled={submitting}
                            className="h-3.5 w-3.5 rounded text-rose-500"
                          />
                          Featured
                        </label>
                        {item.status === 'error' ? (
                          <span className="text-xs text-rose-600">{item.errorMsg ?? 'Failed'}</span>
                        ) : (
                          !submitting && (
                            <button onClick={() => removeItem(item.id)} className="text-rose-300 hover:text-rose-500" aria-label="Remove">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-cream-200 bg-white px-6 py-4">
            {allDone ? (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-sage-700">
                  <CheckCircle2 className="mr-1.5 inline h-4 w-4" />
                  {doneCount} of {items.length} products created successfully.
                </p>
                <button onClick={onDone} className="btn-primary">Done</button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-rose-400">
                  {submitting ? `Uploading ${doneCount}/${items.length}...` : `${items.length} image${items.length === 1 ? '' : 's'} ready`}
                </p>
                <button onClick={handleSubmit} disabled={!readyToSubmit || submitting} className="btn-primary">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    `Upload & Create ${items.length} Products`
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
