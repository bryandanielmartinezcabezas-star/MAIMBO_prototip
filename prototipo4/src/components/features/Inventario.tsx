import { useMemo, useState } from 'react'
import { formatBs, formatBsShort } from '../../domain/money'
import type { Product } from '../../domain/types'
import {
  categoriesOf,
  inventoryValue,
  lowStockSizes,
  outOfStock,
  retailValue,
  search,
  totalStock,
} from '../../services/inventory'
import { useStore } from '../../store/StoreProvider'
import { useToast } from '../../store/ToastProvider'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { EmptyState, SearchBox, StatTile, Thumb } from '../ui/Primitives'
import { Modal } from '../ui/Modal'
import { ProductRow } from './ProductCard'
import { ProductForm } from './ProductForm'

/** Stock control: what is on the shelf, what it is worth, what needs reordering. */
export function Inventario() {
  const { products, saveProduct, deleteProduct } = useStore()
  const { notify } = useToast()

  const [term, setTerm] = useState('')
  const [category, setCategory] = useState('Todo')
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirming, setConfirming] = useState<Product | null>(null)

  const categories = useMemo(() => ['Todo', ...categoriesOf(products)], [products])
  const visible = useMemo(() => search(products, { term, category }), [products, term, category])

  const units = useMemo(() => products.reduce((n, p) => n + totalStock(p), 0), [products])
  const low = useMemo(() => lowStockSizes(products), [products])
  const empty = useMemo(() => outOfStock(products), [products])
  const cost = useMemo(() => inventoryValue(products), [products])
  const retail = useMemo(() => retailValue(products), [products])

  const handleSave = (product: Product) => {
    const result = saveProduct(product)
    notify(result.message, 'ok')
    setEditing(null)
    setCreating(false)
  }

  const handleDelete = (product: Product) => {
    deleteProduct(product.id)
    notify(`${product.name} eliminado`, 'ok')
    setConfirming(null)
  }

  return (
    <section className="view view--inventario">
      <header className="view__head">
        <div>
          <h1 className="view__title">Inventario</h1>
          <p className="view__sub">
            {products.length} modelos · {units} unidades en stock
          </p>
        </div>
        <Button onClick={() => setCreating(true)} icon={<Icon name="plus" size={16} />}>
          Nuevo producto
        </Button>
      </header>

      <div className="tiles tiles--4">
        <StatTile label="Unidades" value={String(units)} detail={`${products.length} modelos`} icon="box" />
        <StatTile label="Costo invertido" value={formatBsShort(cost)} detail="Lo que pagaste" icon="tag" />
        <StatTile
          label="Valor de venta"
          value={formatBsShort(retail)}
          detail={`Margen ${formatBsShort(retail - cost)}`}
          icon="chart"
          emphasis
        />
        <StatTile
          label="Por reponer"
          value={String(low.length + empty.length)}
          detail={`${empty.length} agotados · ${low.length} bajos`}
          icon="alert"
        />
      </div>

      {(low.length > 0 || empty.length > 0) && (
        <section className="alerts">
          <header className="alerts__head">
            <Icon name="alert" size={16} />
            <h2>Reposición sugerida</h2>
          </header>
          <div className="alerts__list">
            {empty.slice(0, 4).map((p) => (
              <div key={p.id} className="alerts__item alerts__item--out">
                <Thumb src={p.image} alt="" className="alerts__img" />
                <div>
                  <p className="alerts__name">{p.name}</p>
                  <p className="alerts__note">Agotado en todas las tallas</p>
                </div>
              </div>
            ))}
            {low.slice(0, 6).map((r) => (
              <div key={`${r.product.id}-${r.size}`} className="alerts__item">
                <Thumb src={r.product.image} alt="" className="alerts__img" />
                <div>
                  <p className="alerts__name">{r.product.name}</p>
                  <p className="alerts__note">
                    Talla {r.size} · quedan {r.stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="filters">
        <div className="chips" role="group" aria-label="Categorías">
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
        <SearchBox value={term} onValueChange={setTerm} placeholder="Buscar en inventario" />
      </div>

      {visible.length ? (
        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th aria-label="Foto" />
                <th>Producto</th>
                <th className="cell--hide-sm">Categoría</th>
                <th>Stock por talla</th>
                <th className="cell--num">Precio</th>
                <th className="cell--num cell--hide-sm">Total</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <ProductRow key={p.id} product={p} onEdit={setEditing} onDelete={setConfirming} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon="box" title="Nada por acá" detail="Ningún producto coincide con el filtro." />
      )}

      <ProductForm
        open={creating || editing !== null}
        product={editing}
        products={products}
        onSave={handleSave}
        onClose={() => {
          setEditing(null)
          setCreating(false)
        }}
      />

      <Modal
        open={confirming !== null}
        title="Eliminar producto"
        onClose={() => setConfirming(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => confirming && handleDelete(confirming)}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="prose">
          Se quitará <b>{confirming?.name}</b> del inventario junto con sus {confirming?.sizes.length} tallas
          ({confirming ? totalStock(confirming) : 0} unidades, {formatBs(confirming?.price ?? 0)} c/u).
          Las ventas ya registradas no cambian.
        </p>
      </Modal>
    </section>
  )
}
