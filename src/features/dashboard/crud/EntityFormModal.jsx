import React, { useEffect, useState, useMemo } from 'react';

import { Modal, Input, Textarea, Select, toastWarning, toastSuccess, toastError } from '../../../shared/ui';

import { ModalFormFooter, CheckboxField } from '../components/modalHelpers';

import { uploadService } from '../../../shared/api/uploadService';

import { getContentService } from '../../../shared/lib/getContentService';

import { useDashboardDomain } from '../domain/DomainContext';



function snakeToCamel(name) {

  return name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

}



function pickField(record, fieldName) {

  if (!record) return undefined;

  const direct = record[fieldName];

  if (direct != null && direct !== '') return direct;

  const camel = snakeToCamel(fieldName);

  const alt = record[camel];

  if (alt != null && alt !== '') return alt;

  return undefined;

}



function buildInitial(fields, record) {

  const base = {};

  fields.forEach((f) => {

    if (f.type === 'file') return;

    if (f.type === 'checkbox') {

      const val = pickField(record, f.name);

      base[f.name] = record ? Boolean(val ?? f.default) : Boolean(f.default);

    } else if (f.type === 'number') {

      base[f.name] = pickField(record, f.name) ?? f.default ?? '';

    } else {

      base[f.name] = pickField(record, f.name) ?? f.default ?? '';

    }

  });

  return base;

}



function serializePayload(formData, fields) {

  const body = { ...formData };

  fields.forEach((f) => {

    if (f.type === 'number' && body[f.name] !== '' && body[f.name] != null) {

      body[f.name] = Number(body[f.name]);

    }

    if (f.type === 'textarea' && typeof body[f.name] === 'string' && f.name.startsWith('features_')) {

      body[f.name] = body[f.name].split('\n').filter(Boolean);

    }

  });

  return body;

}



export function EntityFormModal({ isOpen, onClose, config, record, onSaved, currentLanguage = 'en' }) {

  const { adminDomain } = useDashboardDomain();

  const contentService = getContentService(adminDomain);

  const [formData, setFormData] = useState({});

  const [imageFile, setImageFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAr = currentLanguage === 'ar';

  const fields = useMemo(() => config?.fields || [], [config]);



  useEffect(() => {

    if (isOpen && config) {

      setFormData(buildInitial(fields, record));

      setImageFile(null);

    }

  }, [isOpen, record, config, fields]);



  if (!config) return null;



  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

  };



  const uploadImage = async (entityId) => {

    if (!imageFile || !config.imageUpload) return null;

    const { bucket, pathPrefix } = config.imageUpload;

    const ext = imageFile.name.split('.').pop();

    const filePath = `${pathPrefix}/${entityId}.${ext}`;

    const { publicUrl } = await uploadService.uploadFile({ bucket, path: filePath, file: imageFile });

    if (publicUrl) {

      const patch = { image_path: publicUrl };

      return contentService[config.methods.update](entityId, patch);

    }

    return null;

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    const required = fields.filter((f) => f.required && f.type !== 'file');

    const missing = required.some((f) => !String(formData[f.name] || '').trim());

    if (missing) {

      toastWarning(isAr ? 'الرجاء تعبئة الحقول المطلوبة' : 'Please fill required fields');

      return;

    }



    const isCreate = !record?.id;

    setIsSubmitting(true);

    try {

      const body = serializePayload(formData, fields);

      let saved;

      if (record?.id) {

        saved = await contentService[config.methods.update](record.id, body);

      } else {

        saved = await contentService[config.methods.create](body);

      }

      const id = record?.id ?? saved?.id;

      if (id && imageFile) {

        const withImage = await uploadImage(id);

        if (withImage) saved = withImage;

      }

      toastSuccess(isAr ? 'تم الحفظ' : 'Saved');

      onSaved?.(saved ?? { ...body, id }, { isCreate });

    } catch (err) {

      toastError(err.message || 'Save failed');

    } finally {

      setIsSubmitting(false);

    }

  };



  return (

    <Modal

      isOpen={isOpen}

      onClose={onClose}

      title={

        record

          ? isAr

            ? 'تعديل'

            : 'Edit'

          : isAr

            ? 'إضافة'

            : 'Add'

      }

      size="lg"

      footer={

        <ModalFormFooter

          onClose={onClose}

          isSubmitting={isSubmitting}

          onSubmit={handleSubmit}

          cancelLabel={isAr ? 'إلغاء' : 'Cancel'}

          submitLabel={isAr ? 'حفظ' : 'Save'}

          savingLabel="..."

        />

      }

    >

      <form onSubmit={handleSubmit} className="space-y-4">

        {fields.map((field) => {

          if (field.type === 'file') {

            return (

              <div key={field.name}>

                <label className="block text-sm font-medium mb-1">

                  {isAr ? field.labelAr : field.labelEn}

                </label>

                <input type="file" accept={field.accept} onChange={(e) => setImageFile(e.target.files?.[0] || null)} />

              </div>

            );

          }

          if (field.type === 'checkbox') {

            return (

              <CheckboxField

                key={field.name}

                name={field.name}

                checked={Boolean(formData[field.name])}

                onChange={handleChange}

                label={isAr ? field.labelAr : field.labelEn}

              />

            );

          }

          if (field.type === 'textarea') {

            return (

              <Textarea

                key={field.name}

                name={field.name}

                value={formData[field.name] ?? ''}

                onChange={handleChange}

                label={isAr ? field.labelAr : field.labelEn}

                rows={3}

              />

            );

          }

          if (field.type === 'select') {

            return (

              <Select

                key={field.name}

                name={field.name}

                value={formData[field.name] ?? ''}

                onChange={handleChange}

                label={isAr ? field.labelAr : field.labelEn}

                options={(field.options || []).map((o) => ({ value: o, label: o }))}

              />

            );

          }

          return (

            <Input

              key={field.name}

              name={field.name}

              type={field.type === 'number' ? 'number' : 'text'}

              value={formData[field.name] ?? ''}

              onChange={handleChange}

              label={isAr ? field.labelAr : field.labelEn}

              required={field.required}

            />

          );

        })}

      </form>

    </Modal>

  );

}

