import { useState, useEffect } from 'react'
import '../styles/inventory.css'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  image: string
  sku: string
}

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Nike Air Max - White",
        category: "Zapatillas",
        price: 450,
        stock: 12,
        image: "https://images.pexels.com/photos/3407881/pexels-photo-3407881.jpeg?auto=compress&cs=tinysrgb&w=400",
        sku: "NIKE-001"
      },
      {
        id: 2,
        name: "Black Hoodie - Urban Fit",
        category: "Hoodies",
        price: 280,
        stock: 8,
        image: "https://images.pexels.com/photos/3407881/pexels-photo-3407881.jpeg?auto=compress&cs=tinysrgb&w=400",
        sku: "HOOD-001"
      },
      {
        id: 3,
        name: "Adidas Ultraboost - Black",
        category: "Zapatillas",
        price: 520,
        stock: 5,
        image: "https://images.pexels.com/photos/3407881/pexels-photo-3407881.jpeg?auto=compress&cs=tinysrgb&w=400",
        sku: "ADAS-001"
      },
      {
        id: 4,
        name: "Red Oversized T-Shirt",
        category: "Camisetas",
        price: 120,
        stock: 25,
        image: "https://images.pexels.com/photos/2769274/pexels-photo-2769274.jpeg?auto=compress&cs=tinysrgb&w=400",
        sku: "TSHIRT-001"
      },
      {
        id: 5,
        name: "Cargo Pants - Khaki",
        category: "Pantalones",
        price: 250,
        stock: 10,
        image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400",
        sku: "CARGO-001"
      },
      {
        id: 6,
        name: "Puma RS-X - White/Red",
        category: "Zapatillas",
        price: 380,
        stock: 14,
        image: "https://images.pexels.com/photos/3407881/pexels-photo-3407881.jpeg?auto=compress&cs=tinysrgb&w=400",
        sku: "PUMA-001"
      },
    ]
    setProducts(mockProducts)
    setFilteredProducts(mockProducts)
  }, [])

  useEffect(() => {
    const filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, products])

  const categories = ['All', ...new Set(products.map(p => p.category))]

  return (
    <div className="inventory-container animate-slide-in-down">
      <h1 className="inventory-title">INVENTARIO</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product, idx) => (
          <div key={product.id} className="product-card" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="product-image-container">
              <img src={product.image} alt={product.name} className="product-image" />
              <div className="stock-badge">{product.stock} STK</div>
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-sku">{product.sku}</p>
              <div className="product-footer">
                <span className="product-price">${product.price}</span>
                <button className="add-cart-btn">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-results">NO RESULTS FOUND</div>
      )}
    </div>
  )
}
