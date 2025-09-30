'use client'
import { useState, useEffect } from 'react'
import AccountDetails from '../components/account/AccountDetails'
import AccountForm from '../components/account/AccountForm'

export default function AccountPage() {
    const [user, setUser] = useState<{ name: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Örnek: client-side fetch veya localStorage kontrolü
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {user ? (
                <AccountDetails user={user} />
            ) : (
                <AccountForm />
            )}
        </main>
    )
}
