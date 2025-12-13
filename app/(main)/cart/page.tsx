// app/cart/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function CartPage() {
    const [cartItems, setCartItems] = useState([])

    // Örnek data veya API call
    useEffect(() => {
        // Sepet verilerini yükle
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Sepetim</h1>
            {/* Sepet içeriği */}
        </div>
    )
}