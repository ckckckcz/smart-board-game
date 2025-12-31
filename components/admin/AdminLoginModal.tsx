'use client'
import { useState } from 'react';
import { Lock, Eye, EyeOff, X } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (verifyAdminPin(pin)) {
      setPin('');
      setError('');
      onSuccess();
    } else {
      setError('PIN salah. Silakan coba lagi.');
      setPin('');
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
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-foreground mb-6">
            Masukkan PIN Admin
          </h2>

          {/* PIN Input */}
          <div className="relative mb-4">
            <Input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="Masukkan PIN..."
              className="h-12 text-center text-lg font-bold tracking-widest pr-12 rounded-xl border-2"
              maxLength={10}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive text-center mb-4 animate-shake">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!pin}
              className="flex-1 h-12 font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Masuk
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="h-12 px-6 font-bold rounded-xl border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer"
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
