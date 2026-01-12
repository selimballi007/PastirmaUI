'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/authStore';
import { addressService } from '@/app/lib/services/addressService';
import AddressForm from '@/app/components/common/AddressForm';
import type { Address, CreateAddressDTO } from '@/app/types/address';

export default function AddressesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<Address>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
    notes: '',
    isDefault: false,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/account/login?redirect=/account/addresses');
    }
  }, [user, router]);

  // Load addresses
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (err) {
      setError('Adresler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!formData.fullName || !formData.phone || !formData.addressLine1 ||
      !formData.city || !formData.district) {
      setError('Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      const dto: CreateAddressDTO = {
        fullName: formData.fullName,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        postalCode: formData.postalCode,
        notes: formData.notes,
        isDefault: formData.isDefault ?? false,
      };

      await addressService.createAddress(dto);
      setSuccess('Adres başarıyla eklendi.');
      setShowAddForm(false);
      resetForm();
      loadAddresses();

      // Auto-dismiss success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message || 'Adres eklenirken bir hata oluştu.');
    }
  };

  const handleUpdate = async () => {
    if (!editingAddress?.id) return;

    setError('');
    setSuccess('');

    // Validation
    if (!formData.fullName || !formData.phone || !formData.addressLine1 ||
      !formData.city || !formData.district) {
      setError('Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      await addressService.updateAddress(editingAddress.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        postalCode: formData.postalCode,
        notes: formData.notes,
        isDefault: formData.isDefault ?? false,
      });

      setSuccess('Adres başarıyla güncellendi.');
      setEditingAddress(null);
      resetForm();
      loadAddresses();

      // Auto-dismiss success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message || 'Adres güncellenirken bir hata oluştu.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;

    try {
      await addressService.deleteAddress(id);
      setSuccess('Adres başarıyla silindi.');
      loadAddresses();

      // Auto-dismiss success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message || 'Adres silinirken bir hata oluştu.');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      setSuccess('Varsayılan adres güncellendi.');
      loadAddresses();

      // Auto-dismiss success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message || 'İşlem sırasında bir hata oluştu.');
    }
  };

  const startEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      district: '',
      postalCode: '',
      notes: '',
      isDefault: false,
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Adreslerim</h1>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Add New Button */}
        {!showAddForm && !editingAddress && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-6 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Yeni Adres Ekle
          </button>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Yeni Adres Ekle</h2>
            <AddressForm
              address={formData}
              onChange={setFormData}
              showDefaultOption={true}
            />
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Kaydet
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="px-6 py-2 border rounded hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editingAddress && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Adresi Düzenle</h2>
            <AddressForm
              address={formData}
              onChange={setFormData}
              showDefaultOption={true}
            />
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Güncelle
              </button>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  resetForm();
                }}
                className="px-6 py-2 border rounded hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Address List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
              <p>Henüz kayıtlı adresiniz yok.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 text-blue-600 hover:underline font-semibold"
              >
                İlk adresinizi ekleyin
              </button>
            </div>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg text-gray-900">{address.fullName}</span>
                      {address.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Varsayılan
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-gray-600">
                      {address.district}, {address.city}
                      {address.postalCode && ` ${address.postalCode}`}
                    </p>
                    <p className="text-gray-600">{address.phone}</p>
                    {address.notes && (
                      <p className="text-gray-500 text-sm mt-2">Not: {address.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id!)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Varsayılan Yap
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(address)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(address.id!)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
