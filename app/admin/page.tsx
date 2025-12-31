'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Layers, BookOpen, BarChart3, Settings, ArrowLeft } from 'lucide-react';
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
            <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
                <AdminLoginModal
                    isOpen={showLoginModal}
                    onClose={handleCloseLogin}
                    onSuccess={handleLoginSuccess}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-card border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground">Panel Admin Guru</h1>
                                <p className="text-xs text-muted-foreground">Smart Shoot Board Game</p>
                            </div>
                        </div>
                        <Link href="/">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="sticky top-[72px] z-30 bg-card/95 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto py-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-all cursor-pointer
                  ${activeTab === tab.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

            {/* Content */}
            <main className="container mx-auto px-4 py-6">
                {renderContent()}
            </main>
        </div>
    );
}