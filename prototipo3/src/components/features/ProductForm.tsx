import { useEffect, useState } from 'react'
import type { Product, ProductKind, SizeStock } from '../../domain/types'
import { SIZE_PRESETS, blankSizes, nextId } from '../../services/inventory'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Field, SelectField } from '../ui/Primitives'

const KIND_OPTIONS: Array<{ value: ProductKind; label: string; category: string; prefix: string }> = [
  { value: 'calzado', label: 'Calzado (38-43)', category: 'Zapatillas Hombre', prefix: 'ZPH' },
  { value: 'prenda', label: 'Prenda (S-XL)', category: 'Camisas Hombre', prefix: 'CAM' },
  { value: 'accesorio', label: 'Accesorio (talla única)', category: 'Lentes', prefix: 'LEN' },
]

interface ProductFormProps {
  open: boolean
  /** null means "create a new one". */
  product: Product | null
  products: Product[]
  onSave: (product: Product) => void
  onClose: () => void
}

const EMPTY = {
  name: '',
  brand: '',
  category: 'Zapatillas Hombre',
  kind: 'calzado' as ProductKind,
  price: '',
  cost: '',
  image: '',
  description: '',
}

export function ProductForm({ open, product, products, onSave, onClose }: ProductFormProps) {
  const [form, setForm] = useState(EMPTY)
  const [sizes, setSizes] = useState<SizeStock[]>(() => blankSizes('calzado'))
  const [error, setError] = useState('')

  // Reload the fields whenever the dialog opens on a different product.
  useEffect(() => {
    if (!open) return
    setError('')
    if (product) {
      setForm({
        name: product.name,
        brand: product.brand,
        category: product.category,
        kind: product.kind,
        price: String(product.price),
        cost: String(product.cost),
        image: product.image,
        description: product.description,
      })
      setSizes(product.sizes.map((s) => ({ ...s })))
    } else {
      setForm(EMPTY)
      setSizes(blankSizes('calzado'))
    }
  }, [open, product])

  const set = (key: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const changeKind = (kind: ProductKind) => {
    const preset = KIND_OPTIONS.find((k) => k.value === kind)!
    setForm((f) => ({ ...f, kind, category: preset.category }))
    setSizes(blankSizes(kind))
  }

  const setSizeStock = (size: string, stock: number) => {
    setSizes((prev) => prev.map((s) => (s.size === size ? { ...s, stock: Math.max(0, stock) } : s)))
  }

  const submit = () => {
    const price = Number(form.price)
    const cost = Number(form.cost || 0)

    if (!form.name.trim()) return setError('Ponle un nombre al producto.')
    if (!Number.isFinite(price) || price <= 0) return setError('El precio debe ser mayor a cero.')
    if (cost > price) return setError('El costo no puede superar al precio de venta.')

    const prefix = KIND_OPTIONS.find((k) => k.value === form.kind)!.prefix

    onSave({
      id: product?.id ?? nextId(products, prefix),
      name: form.name.trim(),
      brand: form.brand.trim() || 'MAINBO',
      category: form.category,
      kind: form.kind,
      price,
      cost,
      image: form.image.trim() || 'img/placeholder.webp',
      description: form.description.trim(),
      rating: product?.rating ?? 4.5,
      sizes,
    })
  }

  return (
    <Modal
      open={open}
      wide
      title={product ? 'Editar producto' : 'Nuevo producto'}
      subtitle={product ? product.id : 'Se genera un código automáticamente'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>{product ? 'Guardar cambios' : 'Crear producto'}</Button>
        </>
      }
    >
      <div className="form">
        <Field
          label="Nombre"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Nike Air Force 1 Blanco"
        />

        <div className="form__row">
          <Field label="Marca" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Nike" />
          <SelectField
            label="Tipo"
            value={form.kind}
            onChange={(e) => changeKind(e.target.value as ProductKind)}
            options={KIND_OPTIONS.map((k) => ({ value: k.value, label: k.label }))}
          />
        </div>

        <div className="form__row">
          <Field
            label="Precio de venta (Bs)"
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="450"
          />
          <Field
            label="Costo (Bs)"
            type="number"
            min={0}
            value={form.cost}
            onChange={(e) => set('cost', e.target.value)}
            hint="Para calcular tu ganancia"
            placeholder="240"
          />
        </div>

        <Field
          label="Categoría"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          placeholder="Zapatillas Hombre"
        />

        <Field
          label="Imagen"
          value={form.image}
          onChange={(e) => set('image', e.target.value)}
          hint="Ruta dentro de public/, por ejemplo img/mi-producto.webp"
          placeholder="img/mi-producto.webp"
        />

        <div className="form__sizes">
          <span className="field__label">Stock por talla</span>
          <div className="sizegrid">
            {sizes.map((s) => (
              <label key={s.size} className="sizegrid__cell">
                <span>{s.size}</span>
                <input
                  type="number"
                  min={0}
                  value={s.stock}
                  onChange={(e) => setSizeStock(s.size, Number(e.target.value))}
                />
              </label>
            ))}
          </div>
          <p className="field__hint">
            Tallas de {KIND_OPTIONS.find((k) => k.value === form.kind)?.label.toLowerCase()} ·{' '}
            {SIZE_PRESETS[form.kind].length} opciones
          </p>
        </div>

        {error && <p className="form__error">{error}</p>}
      </div>
    </Modal>
  )
}
