import React, { useState } from 'react';
import {
  X,
  MapPin,
  CheckCircle2,
  Banknote,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  Truck,
  RotateCcw,
  UserCheck,
  ShoppingBag,
} from 'lucide-react';
import { DeliveryMapPicker } from './DeliveryMapPicker.tsx';
import { CartItem, CustomerUser, DeliveryAddress, Order, PaymentMethod, StoreSettings } from '../types.ts';
import { api } from '../services/api.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  user: CustomerUser;
  onOrderPlaced: (order: Order) => void;
  onOpenAuthModal?: () => void;
  settings?: StoreSettings;
}

type CheckoutStep = 1 | 2 | 3 | 4 | 5;

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  user,
  onOrderPlaced,
  settings,
}) => {
  if (!isOpen) return null;

  const freeThreshold = settings?.freeDeliveryThreshold ?? 500;
  const standardDeliveryFee = settings?.deliveryFee ?? 25;
  const phonepeNumber = settings?.phonepeNumber || '7760616625';
  const phonepeUpiId = settings?.phonepeUpiId || '7760616625@ybl';
  const codEnabled = settings?.codEnabled ?? true;
  const supportPhone = settings?.supportPhone || '7975614686';
  const storeName = settings?.storeName || 'Chodeshwari Kirana Store';

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(
    user.addresses && user.addresses.length > 0 ? 3 : 2
  );
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(
    user.addresses && user.addresses.length > 0 ? user.addresses[0] : null
  );
  const [showMapPicker, setShowMapPicker] = useState(!deliveryAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    codEnabled ? 'Cash on Delivery' : 'PhonePe UPI'
  );
  const [phonePeUtr, setPhonePeUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= freeThreshold ? 0 : standardDeliveryFee;
  const finalTotal = subtotal + deliveryFee;

  const handleConfirmAddress = (addr: DeliveryAddress) => {
    setDeliveryAddress(addr);
    setShowMapPicker(false);
    api.saveAddress(addr).catch(console.warn);
    setCurrentStep(3); // Proceed to Order Summary
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) {
      setError('Please set your delivery address before placing order.');
      setCurrentStep(2);
      setShowMapPicker(true);
      return;
    }

    if (paymentMethod === 'PhonePe UPI' && (!phonePeUtr || phonePeUtr.trim().length < 6)) {
      setError('Please enter the 12-digit PhonePe Transaction Reference / UTR after sending payment.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryAddress,
        paymentMethod,
        phonePeTransactionId: paymentMethod === 'PhonePe UPI' ? phonePeUtr.trim() : undefined,
      };

      const res = await api.createOrder(payload);
      setPlacedOrder(res.order);
      setCurrentStep(5); // Celebration confirmation step
      onOrderPlaced(res.order);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(phonepeUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const stepLabels = [
    { num: 1, label: 'Login' },
    { num: 2, label: 'Delivery' },
    { num: 3, label: 'Summary' },
    { num: 4, label: 'Payment' },
    { num: 5, label: 'Confirmation' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#222222]">
              {currentStep === 5 ? 'Order Placed Successfully!' : 'Express Grocery Checkout'}
            </h3>
            <p className="text-xs text-slate-500">
              Chodeshwari Kirana Store · 15–25 Mins Local Delivery
            </p>
          </div>
          {currentStep !== 5 && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 5-Step Visual Progress Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#F8FAF8] border-b border-slate-200/80">
          <div className="relative flex items-center justify-between max-w-md mx-auto">
            {/* Connecting Track */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-4 h-0.5 bg-[#168A45] -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />

            {stepLabels.map((s) => {
              const isCompleted = s.num < currentStep;
              const isCurrent = s.num === currentStep;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-[#168A45] text-white'
                        : isCurrent
                        ? 'bg-[#168A45] text-white ring-4 ring-emerald-100'
                        : 'bg-white text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                      isCurrent
                        ? 'text-[#168A45] font-bold'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* STEP 1: Customer Profile Review */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#168A45] text-white rounded-xl">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#075B30] uppercase tracking-wider block">
                      Logged In Customer
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {user.name} (+91 {user.mobile})
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      OTP Verified Account · Ready for Fast Checkout
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 bg-[#168A45] hover:bg-[#075B30] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Delivery Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Delivery Address & GPS Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {deliveryAddress && !showMapPicker ? (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#168A45] text-white rounded-xl mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#075B30] uppercase tracking-wider">
                          Selected Delivery Location
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          {deliveryAddress.houseNo}, {deliveryAddress.street}
                        </p>
                        {deliveryAddress.landmark && (
                          <p className="text-xs text-slate-600">Landmark: {deliveryAddress.landmark}</p>
                        )}
                        <p className="text-xs text-slate-600">
                          {deliveryAddress.villageOrCity} - {deliveryAddress.pincode}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 mt-1">
                          GPS: {deliveryAddress.latitude}, {deliveryAddress.longitude}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="text-xs font-semibold text-[#168A45] hover:underline cursor-pointer"
                    >
                      Change Pin
                    </button>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-5 py-2.5 bg-[#168A45] hover:bg-[#075B30] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Order Summary</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <DeliveryMapPicker
                  initialAddress={deliveryAddress}
                  onConfirmAddress={handleConfirmAddress}
                  onCancel={deliveryAddress ? () => setShowMapPicker(false) : undefined}
                />
              )}
            </div>
          )}

          {/* STEP 3: Order Summary */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-[#168A45] shrink-0" />
                  <span className="text-slate-700 truncate">
                    Deliver to: <strong>{deliveryAddress?.houseNo}, {deliveryAddress?.street}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-[#168A45] font-semibold hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Itemized List */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Basket Items ({cart.reduce((s, i) => s + i.quantity, 0)})
                </h4>

                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-10 h-10 object-contain rounded bg-slate-50 p-1 border border-slate-100"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 block truncate max-w-xs">
                            {item.product.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {item.product.unit} × {item.quantity} (₹{item.product.price} each)
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{item.product.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-semibold text-slate-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee (Within 15–25 Mins)</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {deliveryFee === 0 ? <strong className="text-[#168A45]">FREE</strong> : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                    <span>Grand Total</span>
                    <span className="font-mono text-[#168A45] text-base">₹{finalTotal}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 bg-[#168A45] hover:bg-[#075B30] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Select Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment Selection */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Choose Payment Mode
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* COD (Conditional on store settings) */}
                  {codEnabled && (
                    <label
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        paymentMethod === 'Cash on Delivery'
                          ? 'border-[#168A45] bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-emerald-100 text-[#075B30] rounded-xl">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block">
                              Cash on Delivery
                            </span>
                            <span className="text-xs text-slate-500">Pay cash at doorstep</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={paymentMethod === 'Cash on Delivery'}
                          onChange={() => setPaymentMethod('Cash on Delivery')}
                          className="text-[#168A45] focus:ring-[#168A45] mt-1"
                        />
                      </div>
                      <div className="mt-3 text-[11px] text-[#075B30] bg-emerald-100/60 p-2 rounded-lg">
                        Pay ₹{finalTotal} cash when {storeName} delivery partner arrives at your address.
                      </div>
                    </label>
                  )}

                  {/* PhonePe UPI */}
                  <label
                    onClick={() => setPaymentMethod('PhonePe UPI')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      paymentMethod === 'PhonePe UPI'
                        ? 'border-[#168A45] bg-purple-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${!codEnabled ? 'sm:col-span-2' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">
                            PhonePe UPI
                          </span>
                          <span className="text-xs text-slate-500">Instant digital pay</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'PhonePe UPI'}
                        onChange={() => setPaymentMethod('PhonePe UPI')}
                        className="text-[#168A45] focus:ring-[#168A45] mt-1"
                      />
                    </div>
                    <div className="mt-3 text-[11px] text-purple-900 bg-purple-100/60 p-2 rounded-lg">
                      Transfer directly to PhonePe Number: <strong>{phonepeNumber}</strong>
                    </div>
                  </label>
                </div>
              </div>

              {/* PhonePe Details Form */}
              {paymentMethod === 'PhonePe UPI' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                        PhonePe Store Merchant
                      </h5>
                      <p className="text-xs text-purple-700">
                        Transfer ₹{finalTotal} via PhonePe, GPay, or Paytm
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-900 text-[10px] font-bold rounded">
                      Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-purple-100">
                    <div>
                      <span className="text-slate-500 text-[11px] block">PhonePe Number:</span>
                      <strong className="font-mono text-sm text-purple-950">{phonepeNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">UPI ID:</span>
                      <div className="flex items-center gap-1">
                        <strong className="font-mono text-xs text-purple-950">{phonepeUpiId}</strong>
                        <button
                          type="button"
                          onClick={copyUpiId}
                          className="p-1 hover:bg-slate-100 rounded text-purple-700 cursor-pointer"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-purple-950 mb-1">
                      PhonePe Reference / UTR Number (12 digits) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 432198765432"
                      value={phonePeUtr}
                      onChange={(e) => setPhonePeUtr(e.target.value.trim())}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    />
                    <p className="text-[11px] text-purple-700 mt-1">
                      Our system verifies this reference number before packing the shipment.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 max-w-sm py-3 px-4 bg-[#168A45] hover:bg-[#075B30] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>Placing Your Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order (₹{finalTotal})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Order Confirmation & Receipt */}
          {currentStep === 5 && placedOrder && (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex p-4 bg-emerald-100 text-[#168A45] rounded-full shadow-xs">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Thank you for shopping at <strong>Chodeshwari Kirana Store</strong>.
                </p>
                <div className="mt-3 inline-block bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-800">
                  Order ID: {placedOrder.id}
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-semibold text-slate-800">
                    {placedOrder.customerName} (+91 {placedOrder.customerMobile})
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Payment Mode</span>
                  <span className="font-semibold text-slate-800">
                    {placedOrder.paymentMethod} ({placedOrder.paymentStatus})
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Delivery Address</span>
                  <span className="font-semibold text-slate-800 text-right max-w-xs truncate">
                    {placedOrder.deliveryAddress.houseNo}, {placedOrder.deliveryAddress.street}
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="font-mono text-[#168A45] text-base">₹{placedOrder.totalAmount}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#075B30] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#168A45]" />
                  <span>Estimated Delivery: Within 15–25 Minutes</span>
                </div>
                <a
                  href={`https://wa.me/91${supportPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${storeName}, I have placed order #${placedOrder.id}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-[#075B30]"
                >
                  Order Support (WhatsApp)
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-[#168A45] hover:bg-[#075B30] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Track Live Order & Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
