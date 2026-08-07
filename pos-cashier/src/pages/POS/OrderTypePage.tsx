import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { Button, Card, CardBody } from '../../components/ui';
import { OrderTypeSelector } from '../../components/pos/order-type/OrderTypeSelector';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useLogout, useCreateOrder } from '../../hooks';
import { setOrderType } from '../../store/slices/posSlice';
import { OrderType } from '../../types';

export function OrderTypePage() {
  useDocumentTitle('Pilih Tipe Order - POS');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const logout = useLogout();
  const createOrder = useCreateOrder();

  const handleSelectOrderType = async (type: OrderType) => {
    // Set order type in Redux
    dispatch(setOrderType(type));

    // Navigate based on order type
    if (type === OrderType.DINE_IN_TABLE) {
      // Dine In with table - go to table selection
      navigate('/pos/tables');
    } else {
      // Quick Service or Takeaway - CREATE ORDER FIRST before navigating
      try {
        await createOrder.mutateAsync({
          orderType: type === OrderType.DINE_IN_QUICK ? 'dine_in' : 'take_away',
          customerCount: 1,
        });
        // Navigation happens in useCreateOrder onSuccess callback
        // So we don't need to navigate here
      } catch (error) {
        console.error('Failed to create order:', error);
      }
    }
  };

  const handleBack = () => {
    navigate('/pos');
  };

  const handleLogout = () => {
    logout.mutate({}, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Kembali
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {logout.data?.name || 'Cashier'}
                </p>
                <p className="text-xs text-slate-500">POS Cashier</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                isLoading={logout.isPending}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-amber-100 rounded-full mb-6">
            <ChefHat className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Pilih Tipe Order
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Silakan pilih jenis layanan untuk memulai transaksi baru
          </p>
        </div>

        {/* Order Type Selection */}
        <OrderTypeSelector
          onSelect={handleSelectOrderType}
          isLoading={logout.isPending || createOrder.isPending}
        />

        {/* Info Card */}
        <Card className="mt-12 bg-blue-50 border-blue-100">
          <CardBody>
            <div className="flex gap-4">
              <div className="p-2 bg-blue-100 rounded-lg h-fit">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Tips
                </h3>
                <p className="text-sm text-blue-700">
                  <strong>Dine In (Meja)</strong>: Untuk pelanggan yang makan di tempat dan menggunakan meja.
                  <br />
                  <strong>Quick Service</strong>: Untuk pelanggan yang makan di tempat tanpa meja (counter/bar).
                  <br />
                  <strong>Takeaway</strong>: Untuk pelanggan yang memesan untuk dibawa pulang.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

export default OrderTypePage;
