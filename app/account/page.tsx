'use client'

import { useSelector } from 'react-redux'
import { RootState } from "@/store/index"
import AccountDetails from '../components/account/AccountDetails'
import AccountForm from '../components/account/AccountForm'

export default function AccountPage() {
    const { user } = useSelector((state: RootState) => state.auth)

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
