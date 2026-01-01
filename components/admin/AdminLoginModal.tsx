'use client'
import { useState } from 'react';
import { Lock, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/hooks/useGameStore';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminLoginModal = ({ isOpen, onClose, onSuccess }: AdminLoginModalProps) => {
  const { verifyAdminPin } = useGameStore();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isValid = await verifyAdminPin(pin);
      if (isValid) {
        setPin('');
        setError('');
        onSuccess();
      } else {
        setError('PIN salah. Silakan coba lagi.');
        setPin('');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/60 backdrop-blur-md transition-all duration-300"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white border border-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Decorative Shine */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 mx-auto mb-6 flex items-center justify-center shadow-sm">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
              Akses Admin
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Masukkan PIN Admin untuk melanjutkan
            </p>
          </div>

          {/* PIN Input */}
          <div className="relative mb-6 group">
            <Input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="Masukkan PIN"
              className="h-14 text-center text-xl font-bold tracking-wider pr-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 hover:bg-slate-100/50 focus:bg-white focus:border-blue-500 transition-all duration-300"
              maxLength={10}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 mb-6 animate-pulse">
              <p className="text-sm text-rose-600 text-center font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              variant="outline"
              className="h-12 font-bold rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!pin || isLoading}
              className="h-12 font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Masuk'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
