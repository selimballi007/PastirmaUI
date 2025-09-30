'use client'

export default function ProductCard() {
    return (
        <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold mb-2">Product Name</h3>
            <p className="text-gray-700 mb-4">$19.99</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add to Cart
            </button>
        </div>
    )
}