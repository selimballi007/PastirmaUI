import { fetchAPI } from '@/app/lib/api/client';
import type { Address, CreateAddressDTO, UpdateAddressDTO } from '@/app/types/address';

export const addressService = {
  // Get all addresses for logged-in user
  async getAddresses(): Promise<Address[]> {
    return fetchAPI<Address[]>('address');
  },

  // Get specific address
  async getAddress(id: number): Promise<Address> {
    return fetchAPI<Address>(`address/${id}`);
  },

  // Get default address
  async getDefaultAddress(): Promise<Address | null> {
    try {
      return await fetchAPI<Address>('address/default');
    } catch (error) {
      // If no default address, return null instead of throwing
      return null;
    }
  },

  // Create new address
  async createAddress(dto: CreateAddressDTO): Promise<Address> {
    return fetchAPI<Address>('address', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  // Update address
  async updateAddress(id: number, dto: UpdateAddressDTO): Promise<Address> {
    return fetchAPI<Address>(`address/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  // Delete address
  async deleteAddress(id: number): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`address/${id}`, {
      method: 'DELETE',
    });
  },

  // Set as default
  async setDefaultAddress(id: number): Promise<Address> {
    return fetchAPI<Address>(`address/${id}/set-default`, {
      method: 'PUT',
    });
  },
};
