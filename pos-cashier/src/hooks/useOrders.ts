import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ordersApi, { type CreateOrderPayload } from '../api/orders';
import { setCurrentOrder } from '../store/slices/posSlice';

export function useCreateOrder() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: (order) => {
      // Set current order in Redux
      dispatch(setCurrentOrder(order));
      // Navigate to order session page
      navigate(`/pos/orders/${order.id}`);
    },
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => ordersApi.getById(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000,
  });
}

export function useOrderByNumber(orderNumber: string) {
  return useQuery({
    queryKey: ['orders', 'number', orderNumber],
    queryFn: () => ordersApi.getByOrderNumber(orderNumber),
    enabled: !!orderNumber,
    staleTime: 30 * 1000,
  });
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({
      orderId,
      status,
      cancelledReason,
    }: {
      orderId: string;
      status: string;
      cancelledReason?: string;
    }) => ordersApi.updateStatus(orderId, status, cancelledReason),
  });
}
