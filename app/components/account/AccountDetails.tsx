interface AccountDetailsProps {
    user: { name: string }
}

export default function AccountDetails({ user }: AccountDetailsProps) {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Hesabım</h1>
            <p>Hoş geldiniz, {user.name}!</p>
            {/* Siparişler, profil bilgileri gibi detaylar buraya */}
        </div>
    )
}
