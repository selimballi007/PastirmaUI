"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Turnstile as CloudflareTurnstile } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;

export interface TurnstileHandle {
    /**
     * Execute the Turnstile challenge and return a token
     * @returns Promise that resolves with the token or null on error
     */
    executeAsync: () => Promise<string | null>;

    /**
     * Reset the Turnstile widget
     */
    reset: () => void;
}

interface TurnstileProps {
    /**
     * Optional callback when token is generated
     */
    onSuccess?: (token: string) => void;

    /**
     * Optional callback on error
     */
    onError?: () => void;
}

/**
 * Turnstile CAPTCHA component with imperative API
 *
 * Compatible with reCAPTCHA's executeAsync() pattern for easy migration
 *
 * @example
 * const turnstileRef = useRef<TurnstileHandle>(null);
 * const token = await turnstileRef.current?.executeAsync();
 */
const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(
    ({ onSuccess, onError }, ref) => {
        const turnstileRef = useRef<any>(null);
        const tokenResolverRef = useRef<((token: string | null) => void) | null>(null);

        useImperativeHandle(ref, () => ({
            executeAsync: () => {
                return new Promise<string | null>((resolve) => {
                    tokenResolverRef.current = resolve;

                    // Trigger Turnstile execution
                    if (turnstileRef.current) {
                        turnstileRef.current.execute();
                    } else {
                        resolve(null);
                    }
                });
            },
            reset: () => {
                if (turnstileRef.current) {
                    turnstileRef.current.reset();
                }
            },
        }));

        const handleSuccess = (token: string) => {
            // Resolve the executeAsync promise if it exists
            if (tokenResolverRef.current) {
                tokenResolverRef.current(token);
                tokenResolverRef.current = null;
            }

            // Call optional callback
            onSuccess?.(token);
        };

        const handleError = () => {
            // Resolve with null on error
            if (tokenResolverRef.current) {
                tokenResolverRef.current(null);
                tokenResolverRef.current = null;
            }

            // Call optional callback
            onError?.();
        };

        return (
            <CloudflareTurnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={handleSuccess}
                onError={handleError}
                options={{
                    theme: "light",
                    size: "normal",
                    execution: "execute", // Explicit execution mode
                }}
            />
        );
    }
);

Turnstile.displayName = "Turnstile";

export default Turnstile;
