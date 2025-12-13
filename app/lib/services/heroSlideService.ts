// app/lib/services/heroSlideService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    discount: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    bgColor: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateHeroSlideDto {
    title: string;
    subtitle?: string;
    description?: string;
    discount?: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    bgColor: string;
}

export interface UpdateHeroSlideDto {
    title: string;
    subtitle?: string;
    description?: string;
    discount?: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    bgColor: string;
}

class HeroSlideService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async getAllSlides(): Promise<HeroSlide[]> {
        const response = await fetch(`${API_BASE_URL}/hero-slide`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Slide\'lar yüklenirken bir hata oluştu');
        }

        return response.json();
    }

    async getSlideById(id: number): Promise<HeroSlide> {
        const response = await fetch(`${API_BASE_URL}/hero-slide/${id}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Slide bulunamadı');
        }

        return response.json();
    }

    async createSlide(data: CreateHeroSlideDto): Promise<HeroSlide> {
        const response = await fetch(`${API_BASE_URL}/hero-slide`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Slide oluşturulurken bir hata oluştu');
        }

        return response.json();
    }

    async updateSlide(id: number, data: UpdateHeroSlideDto): Promise<HeroSlide> {
        const response = await fetch(`${API_BASE_URL}/hero-slide/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Slide güncellenirken bir hata oluştu');
        }

        return response.json();
    }

    async deleteSlide(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/hero-slide/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Slide silinirken bir hata oluştu');
        }
    }

    async toggleSlideStatus(id: number): Promise<{ message: string; isActive: boolean }> {
        const response = await fetch(`${API_BASE_URL}/hero-slide/${id}/toggle-status`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Durum değiştirilirken bir hata oluştu');
        }

        return response.json();
    }

    async reorderSlides(slides: { id: number; displayOrder: number }[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/hero-slide/reorder`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(slides),
        });

        if (!response.ok) {
            throw new Error('Sıralama güncellenirken bir hata oluştu');
        }
    }
}

export const heroSlideService = new HeroSlideService();