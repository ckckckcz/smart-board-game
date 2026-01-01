'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Layers, BookOpen, BarChart3, Settings, ArrowLeft } from 'lucide-react';
import AdminLoginModal from '@/components/admin/AdminLoginModal';
import RoundManager from '@/components/admin/RoundManager';
import QuestionBank from '@/components/admin/QuestionBank';
import AnalyticsPanel from '@/components/admin/AnalyticsPanel';
import SettingsPanel from '@/components/admin/SettingsPanel';
import { useInitializeGame } from '@/hooks/useInitializeGame';
import styles from '../common.module.css';

type AdminTab = 'rounds' | 'questions' | 'analytics' | 'settings';

export default function AdminPanel() {
    const router = useRouter();
    const { isLoading } = useInitializeGame();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(true);
    const [activeTab, setActiveTab] = useState<AdminTab>('rounds');

    const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
        { id: 'rounds', label: 'Babak', icon: <Layers className="w-5 h-5" /> },
        { id: 'questions', label: 'Soal', icon: <BookOpen className="w-5 h-5" /> },
        { id: 'analytics', label: 'Data', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'settings', label: 'Sistem', icon: <Settings className="w-5 h-5" /> },
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
            case 'rounds': return <RoundManager />;
            case 'questions': return <QuestionBank />;
            case 'analytics': return <AnalyticsPanel />;
            case 'settings': return <SettingsPanel />;
            default: return null;
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0288d1' }}>LOADING...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.container}>
                <img src="/assets/background-city-removebg-preview.png" alt="" className={styles.bgCity} />
                <AdminLoginModal isOpen={showLoginModal} onClose={handleCloseLogin} onSuccess={handleLoginSuccess} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <img src="/assets/background-city-removebg-preview.png" alt="" className={styles.bgCity} />

            <header className={styles.header} style={{ marginTop: '1rem', width: '95%', maxWidth: '1200px' }}>
                <div className={styles.playerBadge}>
                    <div style={{ background: '#0288d1', padding: '0.8rem', borderRadius: '15px', border: '3px solid var(--border)' }} className="border-border">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className={styles.playerName}>PANEL GURU</div>
                        <div className={styles.roundName}>Smart Shoot Admin</div>
                    </div>
                </div>

                <button onClick={() => router.push('/')} className={styles.btn} style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
                    <ArrowLeft className="w-5 h-5 mr-2" /> KE GAME
                </button>
            </header>

            <main className={styles.glassCard} style={{ marginTop: '0.5rem', maxWidth: '1200px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${styles.btn} border border-border`}
                            style={{
                                flex: 1,
                                minWidth: '120px',
                                background: activeTab === tab.id ? '' : '#fff',
                                color: activeTab === tab.id ? '' : '#1e293b',
                                border: '3px solid var(--border)',
                                boxShadow: activeTab === tab.id ? '0 5px 0 #01579b' : '0 5px 0 #ccc'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '3px solid var(--border)' }} className="border-border">
                    {renderContent()}
                </div>
            </main>

            <img src="/assets/streets-removebg-preview.png" alt="" className={styles.street} />
            <div className={styles.bottomStrip} />
        </div>
    );
}
