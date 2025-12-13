// app/test-token/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore, useIsAuthenticated } from '@/app/lib/store/authStore';
import { useFetchForTestToken } from '@/app/lib/api/hooks';

export default function TestTokenPage() {
    const user = useAuthStore((state) => state.user);
    const accessToken = useAuthStore((state) => state.accessToken);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const login = useAuthStore((state) => state.login);

    const isAuthenticated = useIsAuthenticated();
    const fetchApi = useFetchForTestToken();

    useEffect(() => {
        console.log('🧪 [TestPage] Mounted/Updated:', {
            hasUser: !!user,
            userEmail: user?.email,
            hasToken: !!accessToken,
            tokenPreview: accessToken?.substring(0, 30),
            isAuthenticated,
        });

        // Check localStorage
        const storedData = localStorage.getItem('auth-store');
        console.log('🧪 [TestPage] localStorage data:', storedData);

        // Check full store state
        console.log('🧪 [TestPage] Full store state:', {
            user: user?.email,
            accessToken: accessToken ? `${accessToken.substring(0, 30)}...` : null,
            isLoading,
            error,
            isAuthenticated,
        });
    }, [user, accessToken, isAuthenticated, isLoading, error]);

    const handleTestRefresh = async () => {
        const apiStart = Date.now();
        console.clear();
        console.log('=== TOKEN REFRESH TEST START ===\n');

        // Get fresh state
        const currentState = useAuthStore.getState();

        console.log('1. Current token info:');
        console.log('   AccessToken:', currentState.accessToken?.substring(0, 30) + '...');
        console.log('   Full token length:', currentState.accessToken?.length);
        console.log('   User:', currentState.user?.email);

        if (!currentState.accessToken) {
            console.error('❌ No access token found!');
            return;
        }

        console.log('\n2. Testing protected endpoint...');

        try {
            const result = await fetchApi(
                'user/test',
                {
                    method: 'POST',
                }
            );
            console.log('✅ Result:', result);
        } catch (error) {
            console.error('❌ Error:', error);
        }
        const apiEnd = Date.now();
        const apiTime = apiEnd - apiStart;
        console.log('TOKEN-REFRESH API call duration:', apiTime + 'ms');
    };

    const handleManualRefresh = async () => {
        console.log('🔄 [TestPage] Manual refresh triggered');

        try {
            // ✅ Mevcut accessToken'ı al (süresi dolmuş olsa bile)
            const currentState = useAuthStore.getState();
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}user/refresh-token`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers,
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Manual refresh successful:', data);
                login(data.accessToken, data.user);
            } else {
                console.error('❌ Manual refresh failed:', response.status);
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
            }
        } catch (error) {
            console.error('❌ Manual refresh error:', error);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Token Test Page</h1>

            <div className="mb-4 p-4 bg-gray-100 rounded">
                <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
                <p><strong>User Name:</strong> {user?.username || 'N/A'}</p>
                <p><strong>Has Token:</strong> {accessToken ? 'Yes ✅' : 'No ❌'}</p>
                <p><strong>Token Length:</strong> {accessToken?.length || 0}</p>
                <p><strong>Token Preview:</strong> {accessToken?.substring(0, 50) || 'N/A'}...</p>
                <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes ✅' : 'No ❌'}</p>
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {error || 'None'}</p>
            </div>

            <div className="space-x-2">
                <button
                    onClick={handleTestRefresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Test Protected Endpoint
                </button>

                <button
                    onClick={handleManualRefresh}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Manual Refresh Token
                </button>

                <button
                    onClick={() => {
                        console.clear();
                        const state = useAuthStore.getState();
                        console.log('Current State:', state);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Log Current State
                </button>
            </div>
        </div>
    );
}