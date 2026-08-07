import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Input, PasswordInput, Button, Divider } from '../../components/ui';
import { SocialLoginButton } from '../../components/auth';
import { useLogin } from '../../hooks';
import { clearError } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import type { LoginRequest } from '../../types';

type LoginFormData = LoginRequest;

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
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = (data: LoginFormData) => {
    // For Dashboard login, always send app: 'dashboard'
    loginMutation.mutate(
      { ...data, app: 'dashboard' },
      {
        onSuccess: () => {
          navigate('/dashboard');
        },
      },
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <Input
        {...register('email')}
        type="email"
        label="Email address"
        placeholder="you@company.com"
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
        <button
          type="button"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none focus:underline"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-6"
        isLoading={loginMutation.isPending}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
      </Button>

      <Divider text="or continue with" className="my-6" />

      <div className="grid grid-cols-2 gap-3">
        <SocialLoginButton provider="google" onClick={() => console.log('Google login clicked')} />
        <SocialLoginButton provider="github" onClick={() => console.log('GitHub login clicked')} />
      </div>

      <p className="text-center text-sm text-slate-600 mt-6">
        Don't have an account?{' '}
        <button
          type="button"
          className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none focus:underline"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}
