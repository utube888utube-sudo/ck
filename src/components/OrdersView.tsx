import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  ChevronRight,
  Phone,
  AlertCircle,
  RefreshCw,
  Send,
} from 'lucide-react';
import { Order, OrderStatus } from '../types.ts';
import { api } from '../services/api.ts';

interface OrdersViewProps {
  onBackToShop: () => void;
}

const STATUS_STEPS: OrderStatus[] = [
  'New Order',
  'Order Accepted',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

export const OrdersView: React.FC<OrdersViewProps> = ({ onBackToShop }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [utrInput, setUtrInput] = useState<{ [orderId: string]: string }>({});
  const [submittingUtr, setSubmittingUtr] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOrders();
      setOrders(res.orders || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Poll status updates
    return () => clearInterval(interval);
  }, []);

  const handleSendUtr = async (orderId: string) => {
    const utr = utrInput[orderId];
    if (!utr || utr.trim().length < 6) {
      alert('Please enter a valid UPI reference / UTR number.');
      return;
    }

    try {
      setSubmittingUtr(orderId);
      await api.submitPhonePeUtr(orderId, utr.trim());
      await fetchOrders();
      alert('UTR submitted successfully! Store owner will verify.');
    } catch (err: any) {
      alert(err.message || 'Failed to update UTR.');
    } finally {
      setSubmittingUtr(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Your Grocery Orders
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fulfillment tracking from Chodeshwari Kirana Store
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2 text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 rounded-xl shadow-xs transition-colors"
            title="Refresh order status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onBackToShop}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
          <p className="text-sm font-medium">Fetching your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="w-16 h-16 text-slate-200 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Items you order via Cash on Delivery or PhonePe UPI will show up here with live delivery status.
          </p>
          <button
            onClick={onBackToShop}
            className="mt-5 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-colors"
          >
            Explore 50 Kirana Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIndex = STATUS_STEPS.indexOf(order.status);
            const isCancelled = order.status === 'Cancelled';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Order Top Strip */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        {order.id}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Ordered on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Total Amount</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      ₹{order.totalAmount}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Status Timeline */}
                {!isCancelled && (
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-emerald-50/20">
                    <div className="relative flex items-center justify-between max-w-xl mx-auto">
                      {/* Connecting Line */}
                      <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                      <div
                        className="absolute top-1/2 left-3 h-0.5 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{
                          width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%`,
                        }}
                      />

                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                          <div
                            key={step}
                            className="relative z-10 flex flex-col items-center text-center"
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                                  : 'bg-white text-slate-400 border-2 border-slate-300'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] mt-1.5 font-semibold max-w-[60px] leading-tight ${
                                isCurrent
                                  ? 'text-emerald-800 font-bold'
                                  : isDone
                                  ? 'text-slate-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notification Alert Box */}
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>
                      {order.status === 'New Order' && 'Order received at Chodeshwari Kirana Store. Awaiting store confirmation.'}
                      {order.status === 'Order Accepted' && 'Store owner accepted your order. Packing fresh staples now.'}
                      {order.status === 'Preparing' && 'Items packed safely in delivery crate.'}
                      {order.status === 'Out for Delivery' && 'Delivery partner is on the way to your GPS address!'}
                      {order.status === 'Delivered' && 'Order successfully delivered. Enjoy fresh cooking!'}
                      {order.status === 'Cancelled' && 'Order was cancelled.'}
                    </span>
                  </div>
                  <a
                    href="https://wa.me/917975614686?text=Hi%20Chodeshwari%20Kirana%20Store%2C%20I%20have%20an%20inquiry%20about%20my%20order."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 shrink-0"
                    title="Message Order Support on WhatsApp"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact Order Support</span>
                  </a>
                </div>

                {/* Ordered Items List */}
                <div className="p-4 sm:p-5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Items ({order.items.length})
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.brand} · {item.unit} × {item.quantity}
                          </span>
                        </div>
                        <div className="text-right font-mono font-medium text-slate-900">
                          ₹{item.itemTotal}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location & UPI submission */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>Delivery Location</span>
                      </div>
                      <p className="text-slate-700">
                        {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}
                      </p>
                      {order.deliveryAddress.landmark && (
                        <p className="text-slate-500">Landmark: {order.deliveryAddress.landmark}</p>
                      )}
                      <p className="text-slate-600">
                        {order.deliveryAddress.villageOrCity} - {order.deliveryAddress.pincode}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">
                        GPS: {order.deliveryAddress.latitude}, {order.deliveryAddress.longitude}
                      </p>
                    </div>

                    {/* PhonePe UTR Submission if UPI and not yet added */}
                    {order.paymentMethod === 'PhonePe UPI' && (
                      <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-purple-900">PhonePe UPI Status</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${order.paymentStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        {order.phonePeTransactionId ? (
                          <p className="text-[11px] text-purple-800 font-mono">
                            UTR Reference: <strong>{order.phonePeTransactionId}</strong>
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            <label className="text-[11px] text-purple-900 block">
                              Enter PhonePe UTR / Reference:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="12-digit UTR"
                                value={utrInput[order.id] || ''}
                                onChange={(e) =>
                                  setUtrInput({ ...utrInput, [order.id]: e.target.value })
                                }
                                className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-purple-300 rounded-lg bg-white"
                              />
                              <button
                                onClick={() => handleSendUtr(order.id)}
                                disabled={submittingUtr === order.id}
                                className="px-3 py-1.5 bg-purple-700 text-white rounded-lg text-xs font-semibold hover:bg-purple-800 transition-colors flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                <span>Submit</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
