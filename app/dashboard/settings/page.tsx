'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/app/lib/api/client';
import {
    User,
    Mail,
    Calendar,
    Shield,
    Key,
    Save,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';

interface UserProfile {
    id: number;
    email: string;
    username: string | null;
    fullName: string | null;
    isVerified: boolean;
    role: string;
    lastLoginAt: string | null;
    createdAt: string;
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        username: '',
        fullName: '',
    });

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const result = await fetchAPI<UserProfile>('user/profile');
            setProfile(result);
            setProfileForm({
                username: result.username || '',
                fullName: result.fullName || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            showMessage('error', 'Profil bilgileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profileForm.username.trim()) {
            showMessage('error', 'Kullanıcı adı boş bırakılamaz');
            return;
        }

        try {
            setSaving(true);
            const result = await fetchAPI<{ message: string; profile: UserProfile }>(
                'user/profile',
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        username: profileForm.username,
                        fullName: profileForm.fullName || null,
                    }),
                }
            );
            setProfile(result.profile);
            showMessage('success', result.message);
        } catch (error: unknown) {
            const err = error as { message?: string };
            showMessage('error', err.message || 'Profil güncellenemedi');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            showMessage('error', 'Tüm şifre alanları doldurulmalıdır');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showMessage('error', 'Yeni şifreler eşleşmiyor');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            showMessage('error', 'Şifre en az 6 karakter olmalı');
            return;
        }

        try {
            setSaving(true);
            const result = await fetchAPI<{ message: string }>(
                'user/change-password',
                {
                    method: 'POST',
                    body: JSON.stringify(passwordForm),
                }
            );
            showMessage('success', result.message);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: unknown) {
            const err = error as { message?: string };
            showMessage('error', err.message || 'Şifre değiştirilemedi');
        } finally {
            setSaving(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Bilinmiyor';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Ayarlar</h1>
                <p className="text-gray-600">Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin</p>
            </div>

            {/* Message Banner */}
            {message && (
                <div
                    className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="grid gap-8">
                {/* Account Information */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Hesap Bilgileri
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{profile?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Shield className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-gray-500">Rol</p>
                                <p className="font-medium text-gray-900">{profile?.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-gray-500">Kayıt Tarihi</p>
                                <p className="font-medium text-gray-900">{formatDate(profile?.createdAt || null)}</p>
                            </div>
                        </div>
                        {profile?.lastLoginAt && (
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <div>
                                    <p className="text-gray-500">Son Giriş</p>
                                    <p className="font-medium text-gray-900">{formatDate(profile.lastLoginAt)}</p>
                                </div>
                            </div>
                        )}
                        <div className="pt-2">
                            {profile?.isVerified ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                    <CheckCircle className="w-4 h-4" />
                                    Email Doğrulanmış
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                                    <AlertCircle className="w-4 h-4" />
                                    Email Doğrulanmamış
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Update Form */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profil Bilgileri
                    </h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kullanıcı Adı *
                            </label>
                            <input
                                type="text"
                                value={profileForm.username}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({ ...prev, username: e.target.value }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                                minLength={3}
                                maxLength={50}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ad Soyad
                            </label>
                            <input
                                type="text"
                                value={profileForm.fullName}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                maxLength={100}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Kaydediliyor...' : 'Profili Güncelle'}
                        </button>
                    </form>
                </div>

                {/* Password Change Form */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Şifre Değiştir
                    </h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mevcut Şifre *
                            </label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) =>
                                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yeni Şifre *
                            </label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                                minLength={6}
                            />
                            <p className="text-sm text-gray-500 mt-1">En az 6 karakter olmalıdır</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yeni Şifre Tekrar *
                            </label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) =>
                                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Key className="w-4 h-4" />
                            {saving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
