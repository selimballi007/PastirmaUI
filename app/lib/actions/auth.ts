'use server'
import { treeifyError, z } from 'zod';
import { cookies } from 'next/headers';

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
    redirectTo?: string;
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

        // ✅ Backend'den gelen cookie'leri Next.js'e manuel olarak set et
        const setCookieHeader = res.headers.get('set-cookie');
        console.log("Cookies from backend:", setCookieHeader);

        if (setCookieHeader) {
            // Set-Cookie header'ı parse et (multiple cookies comma ile ayrılmış olabilir)
            const cookieStrings = setCookieHeader.split(', ');

            const cookieStore = await cookies();

            for (const cookieStr of cookieStrings) {
                // Cookie string'i parse et: "name=value; options..."
                const [nameValue, ...options] = cookieStr.split('; ');
                const [name, value] = nameValue.split('=');

                if (name && value) {
                    // Cookie options'ları parse et
                    const cookieOptions: any = {
                        httpOnly: options.some(opt => opt.toLowerCase() === 'httponly'),
                        secure: options.some(opt => opt.toLowerCase() === 'secure'),
                        sameSite: 'lax' as const, // Backend'den lax geliyor
                        path: '/',
                    };

                    // Expires varsa ekle
                    const expiresOption = options.find(opt => opt.toLowerCase().startsWith('expires='));
                    if (expiresOption) {
                        const expiresDate = new Date(expiresOption.split('=')[1]);
                        cookieOptions.expires = expiresDate;
                    }

                    // Max-Age varsa ekle
                    const maxAgeOption = options.find(opt => opt.toLowerCase().startsWith('max-age='));
                    if (maxAgeOption) {
                        cookieOptions.maxAge = parseInt(maxAgeOption.split('=')[1]);
                    }

                    console.log(`Setting cookie: ${name}`, cookieOptions);
                    cookieStore.set(name, value, cookieOptions);
                }
            }
        }

        const totalTime = Date.now() - startTime;
        const apiTime = apiEnd - apiStart;

        console.log(`🚀 Login Performance:
        - Total Time: ${totalTime}ms
        - API Time: ${apiTime}ms
        - Processing Time: ${totalTime - apiTime}ms`);
        console.log("User data:", data.user);

        return {
            success: true,
            message: "✅ Giriş başarılı! Yönlendiriliyorsunuz...",
            user: data.user,
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

// Verify Email Schema - captchaToken optional (email access proves identity)
const VerifyEmailSchema = z.object({
    token: z.string().min(1, "Token geçersiz veya eksik."),
    captchaToken: z.string().optional(), // Optional - email verification doesn't need captcha
});

// Resend Verification by Token Schema - captchaToken also optional
const ResendVerificationByTokenSchema = z.object({
    token: z.string().min(1, "Token geçersiz veya eksik."),
    captchaToken: z.string().optional(), // Optional - resend doesn't need captcha either
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

/**
 * Logout Action - Manually deletes cookies and calls backend logout
 *
 * Just like we manually SET cookies during login, we must manually DELETE them during logout
 * because Next.js Server Actions don't automatically handle cookie operations from backend responses
 */
export async function logoutAction(): Promise<{ success: boolean }> {
    try {
        console.log('🔴 [LogoutAction] Starting logout process...');

        // 1. Call backend logout endpoint (optional - mainly for token invalidation on server)
        try {
            // ✅ Get cookies to send with request
            const cookieStore = await cookies();
            const accessToken = cookieStore.get('accessToken')?.value;
            const refreshToken = cookieStore.get('refreshToken')?.value;

            // Build Cookie header if tokens exist
            const cookieHeader = [
                accessToken ? `accessToken=${accessToken}` : '',
                refreshToken ? `refreshToken=${refreshToken}` : ''
            ].filter(Boolean).join('; ');

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
                },
            });

            if (res.ok) {
                console.log('✅ [LogoutAction] Backend logout successful');
            } else {
                console.log('⚠️ [LogoutAction] Backend logout failed, continuing with cookie cleanup');
            }
        } catch (error) {
            console.log('⚠️ [LogoutAction] Backend logout request failed:', error);
            // Continue anyway - we'll clear cookies manually
        }

        // 2. Manually delete cookies using Next.js cookies() API
        // This is CRITICAL - just like we manually set cookies during login
        const cookieStore = await cookies();

        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');

        console.log('✅ [LogoutAction] Cookies deleted successfully');

        return { success: true };

    } catch (error) {
        console.error('❌ [LogoutAction] Logout error:', error);

        // Even if there's an error, try to delete cookies
        try {
            const cookieStore = await cookies();
            cookieStore.delete('accessToken');
            cookieStore.delete('refreshToken');
        } catch (cookieError) {
            console.error('❌ [LogoutAction] Cookie deletion failed:', cookieError);
        }

        return { success: false };
    }
}

/**
 * Refresh Token Action - Manually sets new cookies from backend
 *
 * Just like login/logout, we must manually handle cookies because Next.js Server Actions
 * don't automatically forward Set-Cookie headers from backend responses
 */
export async function refreshTokenAction(): Promise<{ success: boolean; user?: any }> {
    try {
        console.log('🔄 [RefreshTokenAction] Starting token refresh...');

        // Get current cookies to send with request
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (!accessToken || !refreshToken) {
            console.log('❌ [RefreshTokenAction] No tokens found in cookies');
            return { success: false };
        }

        // ✅ CRITICAL: Manually send cookies in Cookie header
        // Server Actions run on Next.js server, not browser - must manually forward cookies
        const cookieHeader = `accessToken=${accessToken}; refreshToken=${refreshToken}`;
        console.log('[RefreshTokenAction] Sending cookies to backend');
        console.log('[RefreshTokenAction] Cookie header:', cookieHeader.substring(0, 100) + '...');

        // Call backend refresh-token endpoint
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader, // ✅ Manually send cookies
            },
        });

        console.log('[RefreshTokenAction] Response status:', res.status);

        if (!res.ok) {
            // ✅ CRITICAL: Log the actual error response from backend
            const errorText = await res.text();
            console.error('[RefreshTokenAction] Refresh failed with status:', res.status);
            console.error('[RefreshTokenAction] Error response:', errorText);

            try {
                const errorJson = JSON.parse(errorText);
                console.error('[RefreshTokenAction] Parsed error:', errorJson);
            } catch (e) {
                console.error('[RefreshTokenAction] Could not parse error as JSON');
            }

            return { success: false };
        }

        // Parse response to get user data
        const data = await res.json();

        // ✅ CRITICAL: Manually parse and set new cookies from backend response
        const setCookieHeader = res.headers.get('set-cookie');
        console.log('[RefreshTokenAction] Set-Cookie header:', setCookieHeader);

        if (setCookieHeader) {
            const cookieStrings = setCookieHeader.split(', ');
            const newCookieStore = await cookies();

            for (const cookieStr of cookieStrings) {
                const [nameValue, ...options] = cookieStr.split('; ');
                const [name, value] = nameValue.split('=');

                if (name && value) {
                    const cookieOptions: any = {
                        httpOnly: options.some(opt => opt.toLowerCase() === 'httponly'),
                        secure: options.some(opt => opt.toLowerCase() === 'secure'),
                        sameSite: 'lax' as const,
                        path: '/',
                    };

                    const expiresOption = options.find(opt => opt.toLowerCase().startsWith('expires='));
                    if (expiresOption) {
                        cookieOptions.expires = new Date(expiresOption.split('=')[1]);
                    }

                    const maxAgeOption = options.find(opt => opt.toLowerCase().startsWith('max-age='));
                    if (maxAgeOption) {
                        cookieOptions.maxAge = parseInt(maxAgeOption.split('=')[1]);
                    }

                    console.log(`✅ [RefreshTokenAction] Setting cookie: ${name}`);
                    newCookieStore.set(name, value, cookieOptions);
                }
            }
        }

        console.log('✅ [RefreshTokenAction] Token refresh successful');
        return { success: true, user: data.user };

    } catch (error) {
        console.error('❌ [RefreshTokenAction] Refresh error:', error);
        return { success: false };
    }
}
