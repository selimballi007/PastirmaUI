// types/contact.ts - Contact message-related type definitions

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    createdDate: string;
    isRead: boolean;
    readAt?: string;
    isReplied: boolean;
    repliedAt?: string;
    notes?: string;
}
