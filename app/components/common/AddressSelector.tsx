'use client';

import type { Address } from '@/app/types/address';

interface AddressSelectorProps {
  addresses: Address[];
  selectedId?: number;
  onSelect: (address: Address) => void;
  onAddNew: () => void;
  onEdit?: (address: Address) => void;
  onDelete?: (addressId: number) => void;
}

export default function AddressSelector({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  onEdit,
  onDelete
}: AddressSelectorProps) {
  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={`p-4 border rounded cursor-pointer transition-colors ${
            selectedId === address.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onSelect(address)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start flex-1">
              <input
                type="radio"
                name="selectedAddress"
                checked={selectedId === address.id}
                onChange={() => onSelect(address)}
                className="mr-3 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{address.fullName}</span>
                  {address.isDefault && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Varsayılan
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm mt-1">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>
                <p className="text-gray-600 text-sm">
                  {address.district}, {address.city}
                  {address.postalCode && ` ${address.postalCode}`}
                </p>
                <p className="text-gray-600 text-sm">{address.phone}</p>
                {address.notes && (
                  <p className="text-gray-500 text-xs mt-1 italic">{address.notes}</p>
                )}
              </div>
            </div>

            {(onEdit || onDelete) && (
              <div className="flex gap-2 ml-4">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(address);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Düzenle
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
                        onDelete(address.id!);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Sil
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={onAddNew}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
      >
        + Yeni Adres Ekle
      </button>
    </div>
  );
}
