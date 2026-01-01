'use client'

import { useState } from 'react';
import { Eye, EyeOff, Key, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/hooks/useGameStore';
import { toast } from 'sonner';

interface SettingsPanelProps {
  onBack?: () => void;
}

const SettingsPanel = ({ onBack }: SettingsPanelProps) => {
  const { updateAdminPin } = useGameStore();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handleChangePin = async () => {
    if (!oldPin || !newPin || !confirmPin) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (newPin !== confirmPin) {
      toast.error('PIN baru tidak cocok');
      return;
    }

    if (newPin.length < 4) {
      toast.error('PIN minimal 4 karakter');
      return;
    }

    try {
      const success = await updateAdminPin(oldPin, newPin);

      if (success) {
        toast.success('PIN berhasil diubah!');
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        toast.error('PIN lama salah');
      }
    } catch {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-scale-in">
      <div className="bg-white border border-border rounded-3xl shadow-sm p-8 relative overflow-hidden">

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Key className="w-32 h-32" />
        </div>

        <div className="relative z-10 text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            Keamanan Admin
          </h3>
          <p className="text-slate-500 mt-1 font-medium">Ubah PIN akses untuk dashboard admin</p>
        </div>

        <div className="space-y-5 relative z-10">
          {/* Old PIN */}
          <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider ml-1">
              PIN Lama
            </label>
            <div className="relative group">
              <Input
                type={showOldPin ? 'text' : 'password'}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Masukkan PIN lama..."
                className="h-12 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOldPin(!showOldPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
              >
                {showOldPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2" />

          {/* New PIN */}
          <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider ml-1">
              PIN Baru
            </label>
            <div className="relative group">
              <Input
                type={showNewPin ? 'text' : 'password'}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Buat PIN baru..."
                className="h-12 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPin(!showNewPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
              >
                {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider ml-1">
              Konfirmasi PIN
            </label>
            <div className="relative group">
              <Input
                type={showConfirmPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Ulangi PIN baru..."
                className="h-12 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
              >
                {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8 relative z-10">
          <Button
            onClick={handleChangePin}
            className="flex-1 h-12 font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer transition-all hover:scale-[1.02]"
          >
            Simpan Perubahan
          </Button>
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="h-12 px-6 font-bold rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
