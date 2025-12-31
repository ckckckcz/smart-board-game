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

  const handleChangePin = () => {
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

    const success = updateAdminPin(oldPin, newPin);

    if (success) {
      toast.success('PIN berhasil diubah!');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      toast.error('PIN lama salah');
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-scale-in">
      <div className="bg-slate-900/50 border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden">

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Key className="w-32 h-32" />
        </div>

        <div className="relative z-10 text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-black text-white">
            Keamanan Admin
          </h3>
          <p className="text-slate-400 mt-1 font-medium">Ubah PIN akses untuk dashboard admin</p>
        </div>

        <div className="space-y-5 relative z-10">
          {/* Old PIN */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block uppercase tracking-wider ml-1">
              PIN Lama
            </label>
            <div className="relative group">
              <Input
                type={showOldPin ? 'text' : 'password'}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Masukkan PIN lama..."
                className="h-12 pr-12 rounded-xl bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:bg-black/40 focus:border-indigo-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOldPin(!showOldPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer p-1"
              >
                {showOldPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="h-px bg-white/5 my-2" />

          {/* New PIN */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block uppercase tracking-wider ml-1">
              PIN Baru
            </label>
            <div className="relative group">
              <Input
                type={showNewPin ? 'text' : 'password'}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Buat PIN baru..."
                className="h-12 pr-12 rounded-xl bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:bg-black/40 focus:border-indigo-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPin(!showNewPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer p-1"
              >
                {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-2 block uppercase tracking-wider ml-1">
              Konfirmasi PIN
            </label>
            <div className="relative group">
              <Input
                type={showConfirmPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Ulangi PIN baru..."
                className="h-12 pr-12 rounded-xl bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:bg-black/40 focus:border-indigo-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer p-1"
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
            className="flex-1 h-12 font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
          >
            Simpan Perubahan
          </Button>
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="h-12 px-6 font-bold rounded-xl border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
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
