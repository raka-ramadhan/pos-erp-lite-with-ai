import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  History,
} from 'lucide-react';
import { Button, Card, Input } from '../../components/ui';
import { useOrderWithItems, useOrderCalculation, usePaymentMethods, useProcessPayment } from '../../hooks';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { cn } from '../../utils';
import { ROUTES } from '../../routes/constants';
import type { PaymentMethod } from '../../api/payments';

// Payment type icons
const PAYMENT_TYPE_ICONS = {
  cash: Banknote,
  card: CreditCard,
  qris: QrCode,
  ewallet: QrCode,
};

const PAYMENT_TYPE_LABELS = {
  cash: 'Tunai',
  card: 'Kartu',
  qris: 'QRIS',
  ewallet: 'E-Wallet',
};

type PaymentState = 'idle' | 'processing' | 'success' | 'error';

export function PaymentPage() {
  useDocumentTitle('Pembayaran - POS');
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // Fetch order data
  const { data: orderWithItems, isLoading: orderLoading } = useOrderWithItems(orderId || '');
  const { data: calculation } = useOrderCalculation(orderId || '');

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: methodsLoading } = usePaymentMethods();

  // Process payment mutation
  const processPayment = useProcessPayment();

  // Local state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashAmount, setCashAmount] = useState('');
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Get order and calculation data
  const order = orderWithItems?.order;
  const totalAmount = calculation?.totalAmount ?? order?.totalAmount ?? 0;
  const subtotal = calculation?.subtotal ?? order?.subtotal ?? 0;
  const taxAmount = calculation?.taxAmount ?? order?.taxAmount ?? 0;
  const discountAmount = (calculation as any)?.orderDiscountAmount ?? order?.discountAmount ?? 0;

  // Calculate change for cash
  const cashAmountNum = parseFloat(cashAmount) || 0;
  const changeAmount = cashAmountNum - totalAmount;
  const canPay = selectedMethod?.paymentType === 'cash'
    ? cashAmountNum >= totalAmount
    : selectedMethod !== null;

  // Quick cash amount buttons
  const quickAmounts = useMemo(() => {
    if (totalAmount === 0) return [];
    const amounts = [
      Math.ceil(totalAmount / 1000) * 1000, // Round up to nearest 1000
      Math.ceil(totalAmount / 10000) * 10000, // Round up to nearest 10000
      Math.ceil(totalAmount / 50000) * 50000, // Round up to nearest 50000
    ];
    return [...new Set(amounts)].filter(a => a >= totalAmount).sort((a, b) => a - b);
  }, [totalAmount]);

  // Handle method selection
  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setCashAmount('');
    setErrorMessage('');
  };

  // Handle quick amount selection
  const handleQuickAmount = (amount: number) => {
    setCashAmount(amount.toString());
  };

  // Handle cash input change
  const handleCashChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setCashAmount(numericValue);
  };

  // Handle payment submission
  const handlePay = async () => {
    if (!selectedMethod || !orderId || !canPay) return;

    setPaymentState('processing');
    setErrorMessage('');

    try {
      const payload = {
        orderId,
        paymentMethodId: selectedMethod.id,
        amount: selectedMethod.paymentType === 'cash' ? cashAmountNum : totalAmount,
        changeAmount: selectedMethod.paymentType === 'cash' ? Math.max(0, changeAmount) : 0,
        referenceNumber: undefined,
      };

      const result = await processPayment.mutateAsync(payload);
      setPaymentResult(result);
      setPaymentState('success');
    } catch (error: any) {
      console.error('Payment failed:', error);
      setErrorMessage(error?.response?.data?.message || error?.message || 'Pembayaran gagal');
      setPaymentState('error');
    }
  };

  // Handle done - go back to POS
  const handleDone = () => {
    navigate('/pos', { replace: true });
  };

  // Loading state
  if (orderLoading || methodsLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Order Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-4">Order yang dicari tidak dapat ditemukan.</p>
          <Button onClick={() => navigate('/pos')}>Kembali ke POS</Button>
        </Card>
      </div>
    );
  }

  // Payment Success Screen
  if (paymentState === 'success' && paymentResult) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-slate-500 mb-6">
            Order <span className="font-mono font-semibold">{paymentResult.orderNumber}</span> telah lunas
          </p>

          <Card className="mb-6 text-left">
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Pembayaran</span>
                <span className="font-medium">{paymentResult.paymentMethodName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bayar</span>
                <span className="font-bold text-amber-600">
                  Rp {Number(paymentResult.totalAmount).toLocaleString('id-ID')}
                </span>
              </div>
              {paymentResult.changeAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Kembalian</span>
                  <span className="font-bold">
                    Rp {Number(paymentResult.changeAmount).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {order.table && (
            <p className="text-sm text-slate-500 mb-6">
              Meja <span className="font-semibold">{order.table.tableName}</span> siap dilepas
            </p>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleDone}
          >
            Selesai
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.POS_HISTORY)}
            className="w-full mt-2 text-slate-600 hover:text-amber-600"
          >
            <History className="w-4 h-4 mr-2" />
            Lihat Riwayat Transaksi
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/pos/orders/${orderId}`)}
                className="p-2"
                disabled={paymentState === 'processing'}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Pembayaran</h1>
                <p className="text-xs text-slate-500">
                  {order.table
                    ? `Meja ${order.table.tableName} • ${order.orderNumber}`
                    : order.orderNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Order Summary */}
          <Card>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Diskon</span>
                  <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Pajak (11%)</span>
                  <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold text-amber-600">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Method Selection */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Pilih Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = PAYMENT_TYPE_ICONS[method.paymentType as keyof typeof PAYMENT_TYPE_ICONS] || CreditCard;
                const isSelected = selectedMethod?.id === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method)}
                    disabled={paymentState === 'processing'}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{method.name}</p>
                      <p className="text-xs text-slate-500">
                        {PAYMENT_TYPE_LABELS[method.paymentType as keyof typeof PAYMENT_TYPE_LABELS] || method.paymentType}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Input */}
          <AnimatePresence>
            {selectedMethod?.paymentType === 'cash' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Jumlah Uang (Rp)
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={cashAmount ? Number(cashAmount).toLocaleString('id-ID') : ''}
                        onChange={(e) => handleCashChange(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="0"
                        className="text-2xl font-bold text-right h-14"
                        disabled={paymentState === 'processing'}
                      />
                    </div>

                    {/* Quick Amount Buttons */}
                    {quickAmounts.length > 0 && (
                      <div>
                        <label className="block text-xs text-slate-500 mb-2">Pilih cepat</label>
                        <div className="flex gap-2">
                          {quickAmounts.map((amount) => (
                            <button
                              key={amount}
                              onClick={() => handleQuickAmount(amount)}
                              disabled={paymentState === 'processing'}
                              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                            >
                              {amount.toLocaleString('id-ID')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Change Calculation */}
                    {cashAmountNum > 0 && (
                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Total Bayar</span>
                          <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-slate-500">Uang Masuk</span>
                          <span>Rp {cashAmountNum.toLocaleString('id-ID')}</span>
                        </div>
                        <div className={cn(
                          'flex justify-between font-bold mt-2 pt-2 border-t border-slate-200',
                          changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                          <span>Kembalian</span>
                          <span>Rp {Math.abs(changeAmount).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    )}

                    {/* Insufficient Amount Warning */}
                    {cashAmountNum > 0 && cashAmountNum < totalAmount && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Jumlah uang kurang dari total bayar</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {paymentState === 'error' && errorMessage && (
            <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Card/QRIS Info */}
          <AnimatePresence>
            {selectedMethod && selectedMethod.paymentType !== 'cash' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="bg-blue-50 border-blue-200">
                  <div className="p-4 text-center">
                    <p className="text-blue-700 font-medium mb-1">
                      {selectedMethod.paymentType === 'qris' && 'Scan QRIS untuk pembayaran'}
                      {selectedMethod.paymentType === 'card' && 'Arahkan pelanggan ke terminal'}
                      {selectedMethod.paymentType === 'ewallet' && 'Pindai QR code E-Wallet'}
                    </p>
                    <p className="text-sm text-blue-600">
                      Total: Rp {totalAmount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 flex-shrink-0">
        <Button
          className="w-full"
          size="lg"
          disabled={!canPay || paymentState === 'processing'}
          onClick={handlePay}
        >
          {paymentState === 'processing' ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </span>
          ) : (
            <span>
              Bayar Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default PaymentPage;
