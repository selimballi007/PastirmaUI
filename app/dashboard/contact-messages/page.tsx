'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/app/lib/api/client';
import type { ContactMessage } from '@/app/types/contact';
import type { PagedResult } from '@/app/types/common';
import {
    Mail,
    Calendar,
    User,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Search,
    Eye,
    Trash2,
} from 'lucide-react';

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyData, setReplyData] = useState({ subject: '', message: '' });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, [page]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const result = await fetchAPI<PagedResult<ContactMessage>>(
                `contact/messages?page=${page}&pageSize=10`
            );
            setMessages(result.data || []);
            setTotalPages(result.totalPages || 1);
            setTotalCount(result.totalCount || 0);
        } catch (error) {
            console.error('Error fetching contact messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = (messages || []).filter(
        (message) =>
            message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleViewMessage = async (message: ContactMessage) => {
        setSelectedMessage(message);
        setShowModal(true);

        // Mark as read if not already read
        if (!message.isRead) {
            try {
                await fetchAPI(`contact/messages/${message.id}/read`, {
                    method: 'PUT'
                });

                // Update local state
                setMessages(prevMessages =>
                    prevMessages.map(m =>
                        m.id === message.id
                            ? { ...m, isRead: true, readAt: new Date().toISOString() }
                            : m
                    )
                );

                // Update selected message
                setSelectedMessage(prev =>
                    prev ? { ...prev, isRead: true, readAt: new Date().toISOString() } : null
                );
            } catch (error) {
                console.error('Error marking message as read:', error);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedMessage(null);
    };

    const handleOpenReply = () => {
        if (selectedMessage) {
            setReplyData({
                subject: `Re: ${selectedMessage.subject}`,
                message: ''
            });
            setShowReplyModal(true);
        }
    };

    const handleCloseReply = () => {
        setShowReplyModal(false);
        setReplyData({ subject: '', message: '' });
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMessage) return;

        setIsSending(true);
        try {
            await fetchAPI(`contact/messages/${selectedMessage.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: replyData.subject,
                    message: replyData.message
                })
            });

            // Success - close modals, refresh messages, and show success message
            setShowReplyModal(false);
            setShowModal(false);
            setReplyData({ subject: '', message: '' });

            // Refresh messages to show updated status
            await fetchMessages();

            alert('Yanıt başarıyla gönderildi!');
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Yanıt gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">İletişim Mesajları</h1>
                <p className="text-gray-600">
                    Toplam {totalCount} mesaj
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="İsim, email veya konu ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Mesaj Bulunamadı</h3>
                    <p className="text-gray-600">
                        {searchTerm ? 'Aramanız sonuç vermedi.' : 'Henüz iletişim mesajı yok.'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Messages Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-x-auto mb-8">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Gönderen
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Konu
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tarih
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Durum
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        İşlemler
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredMessages.map((message) => (
                                    <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {message.name}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                    <Mail className="w-3 h-3" />
                                                    {message.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {message.subject}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(message.createdDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                                                    message.isReplied
                                                        ? 'bg-green-100 text-green-800'
                                                        : message.isRead
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}
                                            >
                                                {message.isReplied ? 'Cevaplandı' : message.isRead ? 'Okundu' : 'Okunmadı'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewMessage(message)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Görüntüle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium">
                                Sayfa {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* View Message Modal */}
            {showModal && selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Mesaj Detayı</h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Sender Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Gönderen Bilgileri</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-600">Ad Soyad</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">E-posta</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <a
                                                href={`mailto:${selectedMessage.email}`}
                                                className="font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                {selectedMessage.email}
                                            </a>
                                        </div>
                                    </div>
                                    {selectedMessage.phone && (
                                        <div>
                                            <label className="text-sm text-gray-600">Telefon</label>
                                            <p className="font-medium text-gray-900 mt-1">{selectedMessage.phone}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm text-gray-600">Tarih</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <p className="font-medium text-gray-900">{formatDate(selectedMessage.createdDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="text-sm text-gray-600">Konu</label>
                                <p className="font-semibold text-gray-900 mt-1 text-lg">{selectedMessage.subject}</p>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-sm text-gray-600">Mesaj</label>
                                <div className="mt-2 bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="text-sm text-gray-600">Durum</label>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${
                                                selectedMessage.isReplied
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedMessage.isRead
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-orange-100 text-orange-800'
                                            }`}
                                        >
                                            {selectedMessage.isReplied ? 'Cevaplandı' : selectedMessage.isRead ? 'Okundu' : 'Okunmadı'}
                                        </span>
                                    </div>
                                </div>
                                {selectedMessage.readAt && (
                                    <div>
                                        <label className="text-sm text-gray-600">Okunma Tarihi</label>
                                        <p className="font-medium text-gray-900 mt-1">{formatDate(selectedMessage.readAt)}</p>
                                    </div>
                                )}
                                {selectedMessage.repliedAt && (
                                    <div>
                                        <label className="text-sm text-gray-600">Cevap Tarihi</label>
                                        <p className="font-medium text-gray-900 mt-1">{formatDate(selectedMessage.repliedAt)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {selectedMessage.notes && (
                                <div>
                                    <label className="text-sm text-gray-600">Notlar</label>
                                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-gray-900">{selectedMessage.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Kapat
                            </button>
                            <button
                                onClick={handleOpenReply}
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Yanıtla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {showReplyModal && selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Reply Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Mesajı Yanıtla</h2>
                            <button
                                onClick={handleCloseReply}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Reply Modal Body */}
                        <form onSubmit={handleSendReply} className="p-6">
                            {/* Recipient Info */}
                            <div className="mb-6 bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Alıcı:</span>
                                        <span className="ml-2 font-medium text-gray-900">{selectedMessage.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">E-posta:</span>
                                        <span className="ml-2 font-medium text-gray-900">{selectedMessage.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="mb-4">
                                <label htmlFor="reply-subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    Konu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="reply-subject"
                                    value={replyData.subject}
                                    onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Mesaj konusu"
                                />
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <label htmlFor="reply-message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mesaj <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="reply-message"
                                    value={replyData.message}
                                    onChange={(e) => setReplyData(prev => ({ ...prev, message: e.target.value }))}
                                    required
                                    rows={8}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    placeholder="Yanıtınızı buraya yazın..."
                                />
                            </div>

                            {/* Original Message Reference */}
                            <div className="mb-6 border-l-4 border-gray-300 pl-4 bg-gray-50 p-4 rounded">
                                <p className="text-sm text-gray-600 mb-2">Orijinal Mesaj:</p>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                            </div>

                            {/* Reply Modal Footer */}
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseReply}
                                    disabled={isSending}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Gönderiliyor...</span>
                                        </>
                                    ) : (
                                        'Gönder'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
