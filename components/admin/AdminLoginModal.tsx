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
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-300"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Decorative Shine */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)]">
            <Lock className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
              Admin Access
            </h2>
            <p className="text-sm text-white/50 font-medium">
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
              placeholder="Enter PIN"
              className="h-14 text-center text-xl font-bold tracking-wider pr-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 hover:bg-white/10 focus:bg-white/10 focus:border-indigo-500/50 transition-all duration-300 shadow-inner"
              maxLength={10}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 animate-pulse">
              <p className="text-sm text-red-400 text-center font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              onClick={handleClose}
              className="h-12 font-bold rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!pin}
              className="h-12 font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/20 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
