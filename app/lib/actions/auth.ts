'use server'
import { cookies } from 'next/headers';
import { treeifyError, z } from 'zod';

// Validation Schema
const LoginSchema = z.object({
    email: z.string()
        .min(1, "Email boş olamaz.")
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Geçerli bir email giriniz."
        ),
    password: z.string()
        .min(6, "Şifre en az 6 karakter olmalı.")
        .max(10, "Şifre çok uzun."),
    captchaToken: z.string().min(1, "ReCAPTCHA doğrulaması gerekli."),
});

const ResendSchema = z.object({
    email: z.string()
        .min(1, "Email boş olamaz.")
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Geçerli bir email giriniz."
        ),
    captchaToken: z.string().min(1, "ReCAPTCHA doğrulaması gerekli."),
});

export type ActionState = {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    showResend?: boolean;
    user?: any;
    accessToken?: string;
}

// Login Action
export async function loginAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const startTime = Date.now();
    // 1. Validate input
    const validatedFields = LoginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        captchaToken: formData.get('captchaToken'),
    });

    if (!validatedFields.success) {
        var formatted = treeifyError(validatedFields.error);
        return {
            success: false,
            errors: {
                email: formatted.properties?.email?.errors || [],
                password: formatted.properties?.password?.errors || [],
                captchaToken: formatted.properties?.captchaToken?.errors || [],
            }
        };
    }

    const { email, password, captchaToken } = validatedFields.data;

    // 2. Call backend API
    try {
        const apiStart = Date.now();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Email: email,
                PasswordHash: password,
                captchaToken,
            }),
            credentials: 'include',
        });
        const apiEnd = Date.now();
        // 3. Handle error responses
        if (!res.ok) {
            const errorData = await res.json().catch(() => null);

            // Email verification needed (504)
            if (res.status === 504) {
                return {
                    success: false,
                    message: errorData?.message || "Email doğrulaması gerekli.",
                    showResend: true,
                };
            }

            // Backend validation errors
            if (errorData?.errors) {
                return {
                    success: false,
                    errors: errorData.errors,
                };
            }

            return {
                success: false,
                message: errorData?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.",
            };
        }

        // 4. Success - Parse response
        const data = await res.json();

        // ✅ Backend'den Set-Cookie header'ını al
        const setCookieHeader = res.headers.get('set-cookie');

        if (setCookieHeader) {
            // Parse refreshToken from Set-Cookie header
            const refreshTokenMatch = setCookieHeader.match(/refreshToken=([^;]+)/);
            if (refreshTokenMatch) {
                const refreshToken = refreshTokenMatch[1];

                // ✅ Next.js cookies API ile set et
                const cookieStore = await cookies();
                cookieStore.set('refreshToken', decodeURIComponent(refreshToken), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                    path: '/',
                });

                console.log('✅ RefreshToken set via Next.js cookies');
            }
        }

        const totalTime = Date.now() - startTime;
        const apiTime = apiEnd - apiStart;

        console.log(`🚀 Login Performance:
        - Total Time: ${totalTime}ms
        - API Time: ${apiTime}ms
        - Processing Time: ${totalTime - apiTime}ms`);
        console.log("User data:", data.user);
        console.log("Access Token:", data.accessToken);
        console.log("res.cookies:", res.headers.get('set-cookie'));
        return {
            success: true,
            message: "✅ Giriş başarılı! Yönlendiriliyorsunuz...",
            user: data.user,
            accessToken: data.accessToken,
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: "❌ Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        };
    }
}

// Resend Verification Action
export async function resendVerificationAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    // 1. Validate input
    const validatedFields = ResendSchema.safeParse({
        email: formData.get('email'),
        captchaToken: formData.get('captchaToken'),
    });

    if (!validatedFields.success) {
        var formatted = treeifyError(validatedFields.error);
        return {
            success: false,
            errors: {
                email: formatted.properties?.email?.errors || [],
                captchaToken: formatted.properties?.captchaToken?.errors || [],
            }
        };
    }

    const { email, captchaToken } = validatedFields.data;

    // 2. Call backend API
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/resend-verification-bye`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Email: email,
                captchaToken,
            }),
            credentials: 'include',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);

            if (errorData?.errors) {
                return {
                    success: false,
                    errors: errorData.errors,
                };
            }

            return {
                success: false,
                message: errorData?.message || "Doğrulama maili gönderilemedi.",
            };
        }

        return {
            success: true,
            message: "✅ Doğrulama maili gönderildi. Lütfen email'inizi kontrol edin.",
        };

    } catch (error) {
        console.error('Resend error:', error);
        return {
            success: false,
            message: "❌ Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        };
    }
}

const RegisterSchema = z.object({
    username: z.string()
        .min(3, "Kullanıcı adı en az 3 karakter olmalı.")
        .max(50, "Kullanıcı adı çok uzun."),
    email: z.string()
        .min(1, "Email boş olamaz.")
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Geçerli bir email giriniz."
        ),
    password: z.string()
        .min(6, "Şifre en az 6 karakter olmalı.")
        .max(100, "Şifre çok uzun."),
    captchaToken: z.string().min(1, "ReCAPTCHA doğrulaması gerekli."),
});

export async function registerAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    // 1. Validate input
    const validatedFields = RegisterSchema.safeParse({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        captchaToken: formData.get('captchaToken'),
    });

    if (!validatedFields.success) {
        var formatted = treeifyError(validatedFields.error);
        return {
            success: false,
            errors: {
                username: formatted.properties?.username?.errors || [],
                email: formatted.properties?.email?.errors || [],
                password: formatted.properties?.password?.errors || [],
                captchaToken: formatted.properties?.captchaToken?.errors || [],
            }
        };
    }

    const { username, email, password, captchaToken } = validatedFields.data;

    // 2. Call backend API - ReCAPTCHA verification .NET'te yapılacak
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Email: email,
                UserName: username,
                PasswordHash: password,
                captchaToken, // .NET bu token'ı Google'da verify edecek
            }),
            credentials: 'include',
        });

        // 3. Handle error responses
        if (!res.ok) {
            const errorData = await res.json().catch(() => null);

            // ReCAPTCHA verification failed in .NET
            if (res.status === 400 && errorData?.message?.includes('captcha')) {
                return {
                    success: false,
                    message: "ReCAPTCHA doğrulaması başarısız. Lütfen tekrar deneyin.",
                };
            }

            // Backend validation errors
            if (errorData?.errors) {
                return {
                    success: false,
                    errors: errorData.errors,
                };
            }

            return {
                success: false,
                message: errorData?.message || "Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.",
            };
        }

        // 4. Success
        return {
            success: true,
            message: "✅ Hesabınızı email adresinize gönderilen linkten aktifleştirebilirsiniz. Gelen klasöründe yoksa Spam klasörünü kontrol ediniz.",
        };

    } catch (error) {
        console.error('Register error:', error);
        return {
            success: false,
            message: "❌ Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        };
    }
}

const ForgotPasswordSchema = z.object({
    email: z.string()
        .min(1, "Email boş olamaz.")
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Geçerli bir email giriniz."
        ),
    captchaToken: z.string().min(1, "ReCAPTCHA doğrulaması gerekli."),
});

export async function forgotPasswordAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    // 1. Validate input
    const validatedFields = ForgotPasswordSchema.safeParse({
        email: formData.get('email'),
        captchaToken: formData.get('captchaToken'),
    });

    if (!validatedFields.success) {
        var formatted = treeifyError(validatedFields.error);
        return {
            success: false,
            errors: {
                email: formatted.properties?.email?.errors || [],
                captchaToken: formatted.properties?.captchaToken?.errors || [],
            }
        };
    }

    const { email, captchaToken } = validatedFields.data;

    // 2. Call backend API - ReCAPTCHA verification .NET'te yapılacak
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Email: email,
                captchaToken, // .NET bu token'ı Google'da verify edecek
            }),
            credentials: 'include',
        });

        // 3. Handle error responses
        if (!res.ok) {
            const errorData = await res.json().catch(() => null);

            // ReCAPTCHA verification failed in .NET
            if (res.status === 400 && errorData?.message?.includes('captcha')) {
                return {
                    success: false,
                    message: "ReCAPTCHA doğrulaması başarısız. Lütfen tekrar deneyin.",
                };
            }

            // Backend validation errors
            if (errorData?.errors) {
                return {
                    success: false,
                    errors: errorData.errors,
                };
            }

            // Genel hata - güvenlik için aynı mesajı göster
            return {
                success: true, // Güvenlik için success=true (email varsa yoksa bilgi verme)
                message: "✅ Eğer kayıtlı bir hesabınız varsa, şifre sıfırlama linki e-posta adresinize gönderildi.",
            };
        }

        // 4. Success
        return {
            success: true,
            message: "✅ Eğer kayıtlı bir hesabınız varsa, şifre sıfırlama linki e-posta adresinize gönderildi. Spam klasörünü kontrol etmeyi unutmayın.",
        };

    } catch (error) {
        console.error('Forgot password error:', error);
        return {
            success: false,
            message: "❌ Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        };
    }
}

export type ResetPasswordActionState = {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    tokenError?: boolean
}

const ResetPasswordSchema = z.object({
    token: z.string()
        .min(1, "Token geçersiz veya eksik."),
    newPassword: z.string()
        .min(6, "Şifre en az 6 karakter olmalı.")
        .max(100, "Şifre çok uzun."),
    //.regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir.")
    //.regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir.")
    //.regex(/[0-9]/, "Şifre en az bir rakam içermelidir."),
    confirmPassword: z.string()
        .min(1, "Şifre tekrarı boş olamaz."),
    captchaToken: z.string().min(1, "ReCAPTCHA doğrulaması gerekli."),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
});

export async function resetPasswordAction(prevState: ResetPasswordActionState | null, formData: FormData): Promise<ResetPasswordActionState> {
    // 1. Validate input
    const validatedFields = ResetPasswordSchema.safeParse({
        token: formData.get('token'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword'),
        captchaToken: formData.get('captchaToken'),
    });

    if (!validatedFields.success) {
        var formatted = treeifyError(validatedFields.error);
        return {
            success: false,
            errors: {
                token: formatted.properties?.token?.errors || [],
                captchaToken: formatted.properties?.captchaToken?.errors || [],
            },
        };
    }

    const { token, newPassword, captchaToken } = validatedFields.data;

    // 2. Call backend API - ReCAPTCHA verification .NET'te yapılacak
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Token: token,
                NewPassword: newPassword,
                captchaToken, // .NET bu token'ı Google'da verify edecek
            }),
            credentials: 'include',
        });

        // 3. Handle error responses
        if (!res.ok) {
            const errorData = await res.json().catch(() => null);

            // Token expired or invalid
            if (res.status === 400 || res.status === 404) {
                return {
                    success: false,
                    message: errorData?.message || "❌ Şifre sıfırlama linki geçersiz veya süresi dolmuş. Lütfen yeni bir link talep edin.",
                    tokenError: true,
                };
            }

            // ReCAPTCHA verification failed
            if (res.status === 400 && errorData?.message?.includes('captcha')) {
                return {
                    success: false,
                    message: "ReCAPTCHA doğrulaması başarısız. Lütfen tekrar deneyin.",
                };
            }

            // Backend validation errors
            if (errorData?.errors) {
                return {
                    success: false,
                    errors: errorData.errors,
                };
            }

            return {
                success: false,
                message: errorData?.message || "❌ Şifre güncellenemedi. Lütfen tekrar deneyin.",
            };
        }

        // 4. Success
        return {
            success: true,
            message: "✅ Şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz.",
        };

    } catch (error) {
        console.error('Reset password error:', error);
        return {
            success: false,
            message: "❌ Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        };
    }
}

// Verify Email Schema
const VerifyEmailSchema = z.object({
    token: z.string().min(1, "Token geçersiz veya eksik."),
    captchaToken: z.string().min(1, "ReCAPTCHA doğrulaması gerekli."),
});

// Resend Verification by Token Schema
const ResendVerificationByTokenSchema = z.object({
    token: z.string().min(1, "Token geçersiz veya eksik."),
    captchaToken: z.string().min(1, "ReCAPTCHA doğrulaması gerekli."),
});

// Verify Email Action
export async function verifyEmailAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    // 1. Validate input
    const validatedFields = VerifyEmailSchema.safeParse({
        token: formData.get('token'),
        captchaToken: formData.get('captchaToken'),
    });

    if (!validatedFields.success) {
        var formatted = treeifyError(validatedFields.error);
        return {
            success: false,
            errors: {
                token: formatted.properties?.token?.errors || [],
                captchaToken: formatted.properties?.captchaToken?.errors || [],
            },
        };
    }

    const { token, captchaToken } = validatedFields.data;

    // 2. Call backend API - ReCAPTCHA verification .NET'te yapılacak
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Token: token,
                captchaToken,
            }),
            credentials: 'include',
        });

        // 3. Handle error responses
        if (!res.ok) {
            const errorData = await res.json().catch(() => null);

            // Token expired
            if (res.status === 400 && errorData?.message?.includes('süresi dolmuş')) {
                return {
                    success: false,
                    message: errorData.message || "❌ Doğrulama linki süresi dolmuş.",
                    showResend: true,
                };
            }

            // Token invalid or already used
            if (res.status === 400 || res.status === 404) {
                return {
                    success: false,
                    message: errorData?.message || "❌ Doğrulama linki geçersiz veya kullanılmış.",
                };
            }

            // ReCAPTCHA verification failed
            if (res.status === 400 && errorData?.message?.includes('captcha')) {
                return {
                    success: false,
                    message: "ReCAPTCHA doğrulaması başarısız. Lütfen tekrar deneyin.",
                };
            }

            return {
                success: false,
                message: errorData?.message || "❌ Doğrulama başarısız oldu.",
            };
        }

        // 4. Success
        return {
            success: true,
            message: "✅ Email adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz.",
        };

    } catch (error) {
        console.error('Verify email error:', error);
        return {
            success: false,
            message: "❌ Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        };
    }
}

// Resend Verification by Token Action
export async function resendVerificationByTokenAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    // 1. Validate input
    const validatedFields = ResendVerificationByTokenSchema.safeParse({
        token: formData.get('token'),
        captchaToken: formData.get('captchaToken'),
    });

    if (!validatedFields.success) {
        var formatted = treeifyError(validatedFields.error);
        return {
            success: false,
            errors: {
                token: formatted.properties?.token?.errors || [],
                captchaToken: formatted.properties?.captchaToken?.errors || [],
            },
        };
    }

    const { token, captchaToken } = validatedFields.data;

    // 2. Call backend API
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/resend-verification-byt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Token: token,
                captchaToken,
            }),
            credentials: 'include',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);

            if (errorData?.errors) {
                return {
                    success: false,
                    errors: errorData.errors,
                };
            }

            return {
                success: false,
                message: errorData?.message || "❌ Mail gönderilemedi.",
            };
        }

        return {
            success: true,
            message: "✅ Yeni doğrulama maili gönderildi. Lütfen gelen kutunuzu kontrol edin.",
        };

    } catch (error) {
        console.error('Resend verification error:', error);
        return {
            success: false,
            message: "❌ Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        };
    }
}
