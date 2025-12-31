'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Layers, BookOpen, BarChart3, Settings, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLoginModal from '@/components/admin/AdminLoginModal';
import RoundManager from '@/components/admin/RoundManager';
import QuestionBank from '@/components/admin/QuestionBank';
import AnalyticsPanel from '@/components/admin/AnalyticsPanel';
import SettingsPanel from '@/components/admin/SettingsPanel';

type AdminTab = 'rounds' | 'questions' | 'analytics' | 'settings';

export default function AdminPanel() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(true);
    const [activeTab, setActiveTab] = useState<AdminTab>('rounds');

    const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
        { id: 'rounds', label: 'Kelola Babak', icon: <Layers className="w-4 h-4" /> },
        { id: 'questions', label: 'Bank Soal', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'analytics', label: 'Analitik', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
    ];

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setShowLoginModal(false);
    };

    const handleCloseLogin = () => {
        setShowLoginModal(false);
        router.replace('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'rounds':
                return <RoundManager />;
            case 'questions':
                return <QuestionBank />;
            case 'analytics':
                return <AnalyticsPanel />;
            case 'settings':
                return <SettingsPanel />;
            default:
                return null;
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
                <AdminLoginModal
                    isOpen={showLoginModal}
                    onClose={handleCloseLogin}
                    onSuccess={handleLoginSuccess}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Subtle Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-lg">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                                <p className="text-xs font-medium text-indigo-400">Smart Shoot Board Game</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/')}
                                className="hidden md:flex text-slate-400 hover:text-white hover:bg-white/5"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Ke Game
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20"
                                onClick={() => setIsAuthenticated(false)}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="sticky top-[73px] z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/5 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300
                                    ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400/50'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                                    }
                                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="container mx-auto px-4 py-8 relative z-10 animate-fade-in">
                {renderContent()}
            </main>
        </div>
    );
}