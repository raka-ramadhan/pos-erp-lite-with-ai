import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Input, PasswordInput, Button, Divider } from '../../components/ui';
import { useLogin } from '../../hooks';
import { clearError } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import type { LoginFormData } from '../../utils';

export function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/pos');
    }
  }, [isAuthenticated, navigate]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = (data: LoginFormData) => {
    // For POS login, always send app: 'pos'
    loginMutation.mutate(
      { ...data, app: 'pos' },
      {
        onSuccess: () => {
          navigate('/pos');
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <Input
        {...register('email')}
        type="email"
        label="Email address"
        placeholder="cashier@nexus.com"
        error={errors.email?.message}
        autoComplete="email"
        onKeyDown={handleKeyDown}
        autoFocus
      />

      <PasswordInput
        {...register('password')}
        label="Password"
        placeholder="Enter your password"
        error={errors.password?.message}
        onKeyDown={handleKeyDown}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-600">Remember me</span>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-6"
        isLoading={loginMutation.isPending}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign in to POS'}
      </Button>

      <Divider text="POS Cashier Terminal" className="my-6" />
    </form>
  );
}
