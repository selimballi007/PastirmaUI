'use client';

import type { Address } from '@/app/types/address';

interface AddressFormProps {
  address: Address;
  onChange: (address: Address) => void;
  showDefaultOption?: boolean;
  disabled?: boolean;
  errors?: Partial<Record<keyof Address, string>>;
}

export default function AddressForm({
  address,
  onChange,
  showDefaultOption = false,
  disabled = false,
  errors = {}
}: AddressFormProps) {
  const handleChange = (field: keyof Address, value: string | boolean) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Ad Soyad *"
          value={address.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          className={`w-full px-4 py-2 border rounded ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
          disabled={disabled}
          required
        />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <input
          type="tel"
          placeholder="Telefon *"
          value={address.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className={`w-full px-4 py-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          disabled={disabled}
          required
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Adres Satırı 1 *"
          value={address.addressLine1}
          onChange={(e) => handleChange('addressLine1', e.target.value)}
          className={`w-full px-4 py-2 border rounded ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`}
          disabled={disabled}
          required
        />
        {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Adres Satırı 2 (Opsiyonel)"
          value={address.addressLine2 || ''}
          onChange={(e) => handleChange('addressLine2', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded"
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="İl *"
            value={address.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={`w-full px-4 py-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            disabled={disabled}
            required
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="İlçe *"
            value={address.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className={`w-full px-4 py-2 border rounded ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
            disabled={disabled}
            required
          />
          {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Posta Kodu (Opsiyonel)"
          value={address.postalCode || ''}
          onChange={(e) => handleChange('postalCode', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded"
          disabled={disabled}
        />
      </div>

      <div>
        <textarea
          placeholder="Notlar (Opsiyonel)"
          value={address.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded"
          rows={3}
          disabled={disabled}
        />
      </div>

      {showDefaultOption && (
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={address.isDefault ?? false}
            onChange={(e) => handleChange('isDefault', e.target.checked)}
            className="mr-2 w-4 h-4"
            disabled={disabled}
          />
          <span className="text-sm text-gray-700">Varsayılan adres olarak kaydet</span>
        </label>
      )}
    </div>
  );
}
