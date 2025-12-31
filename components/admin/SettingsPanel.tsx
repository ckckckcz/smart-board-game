'use client'

import { useState } from 'react';
import { Eye, EyeOff, Key, ArrowLeft } from 'lucide-react';
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
    <div className="max-w-md mx-auto">
      <div className="bg-card rounded-md shadow-soft p-6">
        <div className="w-12 h-12 rounded-md gradient-primary mx-auto mb-4 flex items-center justify-center">
          <Key className="w-6 h-6 text-primary-foreground" />
        </div>

        <h3 className="text-xl font-bold text-center text-foreground mb-6">
          Ubah PIN Admin
        </h3>

        <div className="space-y-4">
          {/* Old PIN */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              PIN Lama
            </label>
            <div className="relative">
              <Input
                type={showOldPin ? 'text' : 'password'}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Masukkan PIN lama..."
                className="h-11 pr-12 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowOldPin(!showOldPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showOldPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New PIN */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              PIN Baru
            </label>
            <div className="relative">
              <Input
                type={showNewPin ? 'text' : 'password'}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Masukkan PIN baru..."
                className="h-11 pr-12 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowNewPin(!showNewPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Konfirmasi PIN Baru
            </label>
            <div className="relative">
              <Input
                type={showConfirmPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Ulangi PIN baru..."
                className="h-11 pr-12 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleChangePin}
            className="flex-1 h-11 font-bold rounded-xl gradient-success text-primary-foreground"
          >
            Ubah PIN
          </Button>
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="h-11 px-6 font-bold rounded-xl border-2"
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
