export interface Address {
  id?: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  notes?: string;
  userId?: number;
  isDefault?: boolean;
}

export interface CreateAddressDTO {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  notes?: string;
  isDefault?: boolean;
}

export interface UpdateAddressDTO extends CreateAddressDTO {}
