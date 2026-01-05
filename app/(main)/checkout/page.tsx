'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/app/lib/store/cartStore';
import { useAuthStore } from '@/app/lib/store/authStore';
import { orderService } from '@/app/lib/services/orderService';
import { addressService } from '@/app/lib/services/addressService';
import AddressForm from '@/app/components/common/AddressForm';
import AddressSelector from '@/app/components/common/AddressSelector';
import type { Address, PaymentMethod, CreateOrder } from '@/app/types/order';

const SHIPPING_COST = 50;
const FREE_SHIPPING_THRESHOLD = 500;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [isGuest, setIsGuest] = useState(!user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Saved addresses for logged-in users
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | undefined>();
  const [selectedBillingId, setSelectedBillingId] = useState<number | undefined>();
  const [showAddNewShipping, setShowAddNewShipping] = useState(false);
  const [showAddNewBilling, setShowAddNewBilling] = useState(false);

  // Guest info
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Shipping address
  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
    notes: '',
  });

  // Billing address
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [billingAddress, setBillingAddress] = useState<Address>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
    notes: '',
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(1); // PayAtDoor

  // Order notes
  const [orderNotes, setOrderNotes] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  // Load saved addresses for logged-in users
  useEffect(() => {
    const loadAddresses = async () => {
      if (user) {
        try {
          const addresses = await addressService.getAddresses();
          setSavedAddresses(addresses);

          // Auto-select default address
          const defaultAddr = addresses.find(a => a.isDefault);
          if (defaultAddr && defaultAddr.id) {
            setSelectedShippingId(defaultAddr.id);
            setShippingAddress(defaultAddr);
          } else if (addresses.length > 0) {
            // If no default, show selector without auto-selecting
            setShowAddNewShipping(false);
          } else {
            // No saved addresses, show form
            setShowAddNewShipping(true);
          }
        } catch (error) {
          console.error('Failed to load addresses:', error);
          setShowAddNewShipping(true);
        }
      }
    };

    loadAddresses();
  }, [user]);

  // Calculate totals
  const subTotal = getTotalPrice();
  const shippingCost = subTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const totalAmount = subTotal + shippingCost;

  const handleNextStep = () => {
    setError('');

    // Validate current step
    if (step === 1 && isGuest) {
      if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
        setError('Lütfen tüm misafir bilgilerini doldurun.');
        return;
      }
    }

    if (step === 2) {
      if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 ||
          !shippingAddress.city || !shippingAddress.district) {
        setError('Lütfen zorunlu teslimat adres bilgilerini doldurun.');
        return;
      }
    }

    if (step === 3 && !useSameAddress) {
      if (!billingAddress.fullName || !billingAddress.phone || !billingAddress.addressLine1 ||
          !billingAddress.city || !billingAddress.district) {
        setError('Lütfen zorunlu fatura adres bilgilerini doldurun.');
        return;
      }
    }

    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const orderData: CreateOrder = {
        guestName: isGuest ? guestInfo.name : undefined,
        guestEmail: isGuest ? guestInfo.email : undefined,
        guestPhone: isGuest ? guestInfo.phone : undefined,
        shippingAddress,
        billingAddress: useSameAddress ? undefined : billingAddress,
        orderItems: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
        notes: orderNotes || undefined,
      };

      const order = await orderService.createOrder(orderData);

      // Clear cart after successful order
      clearCart();

      // Redirect to order confirmation
      router.push(`/order-confirmation/${order.orderNumber}`);
    } catch (err: unknown) {
      setError((err as Error).message || 'Sipariş oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Giriş', 'Teslimat', 'Fatura', 'Ödeme', 'Özet'].map((label, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-blue-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <span className="text-sm mt-2">{label}</span>
                {index < 4 && (
                  <div className={`h-1 w-full ${step > index + 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Step 1: Guest/Login */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Giriş Bilgileri</h2>

                  {!user ? (
                    <>
                      <div className="mb-6">
                        <button
                          onClick={() => router.push('/login?redirect=/checkout')}
                          className="w-full py-3 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Giriş Yap
                        </button>
                      </div>

                      <div className="text-center mb-4 text-gray-500">veya</div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Misafir Olarak Devam Et</h3>
                        <input
                          type="text"
                          placeholder="Ad Soyad"
                          value={guestInfo.name}
                          onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                          className="w-full px-4 py-2 border rounded"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={guestInfo.email}
                          onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                          className="w-full px-4 py-2 border rounded"
                        />
                        <input
                          type="tel"
                          placeholder="Telefon"
                          value={guestInfo.phone}
                          onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                          className="w-full px-4 py-2 border rounded"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-700">
                        <strong>{user.username}</strong> olarak giriş yaptınız ({user.email})
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Teslimat Adresi</h2>

                  {user && savedAddresses.length > 0 && !showAddNewShipping ? (
                    <>
                      <AddressSelector
                        addresses={savedAddresses}
                        selectedId={selectedShippingId}
                        onSelect={(address) => {
                          setSelectedShippingId(address.id);
                          setShippingAddress(address);
                        }}
                        onAddNew={() => setShowAddNewShipping(true)}
                      />
                    </>
                  ) : (
                    <>
                      <AddressForm
                        address={shippingAddress}
                        onChange={setShippingAddress}
                        showDefaultOption={false}
                      />

                      {user && savedAddresses.length > 0 && (
                        <button
                          onClick={() => setShowAddNewShipping(false)}
                          className="mt-4 text-blue-600 hover:underline"
                        >
                          ← Kayıtlı adreslerden seç
                        </button>
                      )}

                      {!user && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">
                            💡 <strong>Hesap oluşturarak</strong> adreslerinizi kaydedebilir ve bir sonraki alışverişinizde hızlıca kullanabilirsiniz.
                          </p>
                          <button
                            onClick={() => router.push('/register?redirect=/checkout')}
                            className="mt-2 text-blue-600 hover:underline font-semibold"
                          >
                            Hesap Oluştur
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Billing Address */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Fatura Adresi</h2>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useSameAddress}
                        onChange={(e) => setUseSameAddress(e.target.checked)}
                        className="mr-2"
                      />
                      <span>Teslimat adresi ile aynı</span>
                    </label>
                  </div>

                  {!useSameAddress && (
                    <>
                      {user && savedAddresses.length > 0 && !showAddNewBilling ? (
                        <AddressSelector
                          addresses={savedAddresses}
                          selectedId={selectedBillingId}
                          onSelect={(address) => {
                            setSelectedBillingId(address.id);
                            setBillingAddress(address);
                          }}
                          onAddNew={() => setShowAddNewBilling(true)}
                        />
                      ) : (
                        <>
                          <AddressForm
                            address={billingAddress}
                            onChange={setBillingAddress}
                            showDefaultOption={false}
                          />

                          {user && savedAddresses.length > 0 && (
                            <button
                              onClick={() => setShowAddNewBilling(false)}
                              className="mt-4 text-blue-600 hover:underline"
                            >
                              ← Kayıtlı adreslerden seç
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Payment Method */}
              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Ödeme Yöntemi</h2>

                  <div className="space-y-4">
                    <label className="block p-4 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="1"
                        checked={paymentMethod === 1}
                        onChange={() => setPaymentMethod(1)}
                        className="mr-3"
                      />
                      <span className="font-semibold">Kapıda Ödeme</span>
                      <p className="text-sm text-gray-600 ml-6">Siparişinizi teslim alırken nakit veya kart ile öde</p>
                    </label>

                    <label className="block p-4 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="0"
                        checked={paymentMethod === 0}
                        onChange={() => setPaymentMethod(0)}
                        className="mr-3"
                      />
                      <span className="font-semibold">Kredi Kartı</span>
                      <p className="text-sm text-gray-600 ml-6">Güvenli ödeme (Demo için aktif değil)</p>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 5: Order Summary */}
              {step === 5 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Sipariş Özeti</h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Ürünler</h3>
                      {items.map(item => (
                        <div key={item.productId} className="flex justify-between py-2 border-b">
                          <span>{item.productName} x{item.quantity}</span>
                          <span>{(item.price * item.quantity).toFixed(2)} TL</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Teslimat Adresi</h3>
                      <p className="text-gray-700">
                        {shippingAddress.fullName}<br />
                        {shippingAddress.addressLine1}<br />
                        {shippingAddress.addressLine2 && <>{shippingAddress.addressLine2}<br /></>}
                        {shippingAddress.district}, {shippingAddress.city} {shippingAddress.postalCode}<br />
                        {shippingAddress.phone}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Ödeme Yöntemi</h3>
                      <p className="text-gray-700">
                        {paymentMethod === 0 ? 'Kredi Kartı' : 'Kapıda Ödeme'}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Sipariş Notu (Opsiyonel)</h3>
                      <textarea
                        placeholder="Siparişiniz ile ilgili özel bir notunuz var mı?"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-4 py-2 border rounded"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    onClick={handlePreviousStep}
                    className="px-6 py-2 border rounded hover:bg-gray-50"
                    disabled={loading}
                  >
                    Geri
                  </button>
                )}

                {step < 5 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-auto"
                    disabled={loading}
                  >
                    İleri
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-auto"
                    disabled={loading}
                  >
                    {loading ? 'Sipariş Oluşturuluyor...' : 'Siparişi Tamamla'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Sipariş Özeti</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span>{subTotal.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo</span>
                  <span>{shippingCost === 0 ? 'Ücretsiz' : `${shippingCost.toFixed(2)} TL`}</span>
                </div>
                {subTotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-sm text-gray-600">
                    {(FREE_SHIPPING_THRESHOLD - subTotal).toFixed(2)} TL daha alışveriş yapın, kargo ücretsiz!
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Toplam</span>
                  <span>{totalAmount.toFixed(2)} TL</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>• Güvenli ödeme</p>
                <p>• Hızlı teslimat</p>
                <p>• 14 gün iade garantisi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
