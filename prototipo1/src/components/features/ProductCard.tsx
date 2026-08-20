import { useState } from 'react'
import { formatBs } from '../../domain/money'
import type { Product } from '../../domain/types'
import { stockFor, totalStock } from '../../services/inventory'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Thumb } from '../ui/Primitives'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product, size: string) => void
}

/**
 * Shop-floor card: pick a size, add to the ticket. Sizes with no stock are
 * visibly dead rather than hidden, so the seller can answer "¿hay en 42?".
 */
export function ProductCard({ product, onAdd }: ProductCardProps) {
  const available = product.sizes.filter((s) => s.stock > 0)
  const [size, setSize] = useState(() => available[0]?.size ?? product.sizes[0]?.size ?? '')

  const stock = totalStock(product)
  const soldOut = stock === 0
  const selectedStock = stockFor(product, size)

  return (
    <article className={`pcard ${soldOut ? 'pcard--out' : ''}`.trim()}>
      <div className="pcard__media">
        <Thumb src={product.image} alt={product.name} className="pcard__img" />
        <span className="pcard__cat">{product.category}</span>
        {soldOut ? (
          <span className="pcard__flag pcard__flag--out">Agotado</span>
        ) : (
          stock <= 5 && <span className="pcard__flag">Ultimas {stock}</span>
        )}
      </div>

      <div className="pcard__body">
        <p className="pcard__brand">{product.brand}</p>
        <h3 className="pcard__name">{product.name}</h3>

        <div className="pcard__sizes" role="group" aria-label="Tallas">
          {product.sizes.map((s) => (
            <button
              key={s.size}
              className={`size ${size === s.size ? 'size--on' : ''} ${s.stock === 0 ? 'size--dead' : ''}`.trim()}
              disabled={s.stock === 0}
              onClick={() => setSize(s.size)}
              title={s.stock === 0 ? 'Sin stock' : `${s.stock} disponibles`}
            >
              {s.size}
            </button>
          ))}
        </div>

        <footer className="pcard__foot">
          <div className="pcard__price">
            <span className="pcard__amount">{formatBs(product.price)}</span>
            {!soldOut && <span className="pcard__stock">{selectedStock} en talla {size}</span>}
          </div>
          <Button
            size="sm"
            disabled={soldOut || selectedStock === 0}
            onClick={() => onAdd(product, size)}
            icon={<Icon name="plus" size={15} />}
            aria-label={`Agregar ${product.name}`}
          />
        </footer>
      </div>
    </article>
  )
}

/** Compact row used by the inventory list, where density beats imagery. */
export function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
}) {
  const stock = totalStock(product)

  return (
    <tr className={stock === 0 ? 'row--out' : ''}>
      <td className="cell--media">
        <Thumb src={product.image} alt="" className="row__img" />
      </td>
      <td>
        <p className="row__name">{product.name}</p>
        <p className="row__meta">
          {product.id} · {product.brand}
        </p>
      </td>
      <td className="cell--hide-sm">
        <Badge>{product.category}</Badge>
      </td>
      <td className="cell--sizes">
        <div className="row__sizes">
          {product.sizes.map((s) => (
            <span
              key={s.size}
              className={`chip ${s.stock === 0 ? 'chip--out' : s.stock <= 3 ? 'chip--low' : ''}`.trim()}
              title={`Talla ${s.size}: ${s.stock}`}
            >
              {s.size}
              <b>{s.stock}</b>
            </span>
          ))}
        </div>
      </td>
      <td className="cell--num">{formatBs(product.price)}</td>
      <td className="cell--num cell--hide-sm">{stock}</td>
      <td className="cell--actions">
        <Button variant="quiet" size="sm" onClick={() => onEdit(product)} icon={<Icon name="edit" size={15} />} aria-label="Editar" />
        <Button variant="quiet" size="sm" onClick={() => onDelete(product)} icon={<Icon name="trash" size={15} />} aria-label="Eliminar" />
      </td>
    </tr>
  )
}
