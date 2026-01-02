// types/testimonial.ts - Testimonial-related type definitions

export interface Testimonial {
    id: number;
    name: string;
    location: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
    avatar: string;
    bgColor: string;
}

export interface TestimonialStat {
    value: string;
    label: string;
    color: string;
}
