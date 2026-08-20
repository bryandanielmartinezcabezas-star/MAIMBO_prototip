import { useMemo, useState } from 'react'
import type { Product } from '../../domain/types'
import { categoriesOf, search } from '../../services/inventory'
import { useStore } from '../../store/StoreProvider'
import { useToast } from '../../store/ToastProvider'
import { EmptyState, SearchBox } from '../ui/Primitives'
import { ProductCard } from './ProductCard'

type SortKey = 'destacados' | 'precio-asc' | 'precio-desc' | 'nombre'

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'destacados', label: 'Destacados' },
  { key: 'precio-asc', label: 'Menor precio' },
  { key: 'precio-desc', label: 'Mayor precio' },
  { key: 'nombre', label: 'A-Z' },
]

function sortProducts(products: Product[], key: SortKey): Product[] {
  const copy = [...products]
  switch (key) {
    case 'precio-asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'precio-desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'nombre':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return copy.sort((a, b) => b.rating - a.rating)
  }
}

/** The browsing screen — what a customer is shown and what the seller sells from. */
export function Catalogo() {
  const { products, addToCart } = useStore()
  const { notify } = useToast()

  const [term, setTerm] = useState('')
  const [category, setCategory] = useState('Todo')
  const [sort, setSort] = useState<SortKey>('destacados')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const categories = useMemo(() => ['Todo', ...categoriesOf(products)], [products])

  const visible = useMemo(
    () => sortProducts(search(products, { term, category, onlyAvailable }), sort),
    [products, term, category, onlyAvailable, sort],
  )

  const handleAdd = (product: Product, size: string) => {
    const result = addToCart(product, size)
    notify(result.ok ? `Agregado · ${product.name} (${size})` : result.message, result.ok ? 'ok' : 'error')
  }

  return (
    <section className="view view--catalogo">
      <header className="view__head">
        <div>
          <h1 className="view__title">Catálogo</h1>
          <p className="view__sub">
            {visible.length} de {products.length} modelos
          </p>
        </div>
        <SearchBox value={term} onValueChange={setTerm} placeholder="Buscar modelo, marca o codigo" />
      </header>

      <div className="filters">
        <div className="chips" role="group" aria-label="Categorias">
          {categories.map((c) => (
            <button
              key={c}
              className={`chipbtn ${category === c ? 'chipbtn--on' : ''}`.trim()}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="filters__right">
          <label className="toggle">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            <span>Solo con stock</span>
          </label>

          <div className="chips">
            {SORTS.map((s) => (
              <button
                key={s.key}
                className={`chipbtn chipbtn--ghost ${sort === s.key ? 'chipbtn--on' : ''}`.trim()}
                onClick={() => setSort(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length ? (
        <div className="pgrid">
          {visible.map((p, i) => (
            <div key={p.id} className="pgrid__cell" style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
              <ProductCard product={p} onAdd={handleAdd} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title="Sin resultados"
          detail="Prueba con otro término o quita los filtros."
        />
      )}
    </section>
  )
}
