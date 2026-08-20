# MAINBO - Sistema POS + Inventario

Dos prototipos de interfaces distintivas para la tienda de ropa **MAINBO MODA** (La Paz, Bolivia). Ambos incluyen sistema de inventario, carrito de compra, y dashboard de ventas.

---

## 🎯 PROTOTIPOS

### **Prototipo 1: Brutalist Streetwear** 🔥
- **Aesthetic**: Bold typography, black/white/red palette, asymmetric layout
- **Tipografía**: Courier Prime (headings) + Urbanist (body)
- **Colores**: #000 (black), #FFF (white), #FF4444 (red energy)
- **Vibe**: Urban, direct, attitude streetwear
- **Diferenciador**: Grid-breaking elements, punchy animations, raw minimalism

**Ubicación**: `/prototipo1`

### **Prototipo 2: Luxury Minimal** ✨
- **Aesthetic**: Elegant typography, white/gold/gray palette, symmetric layout
- **Tipografía**: Playfair Display (headings) + Lato (body)
- **Colores**: #FFF (white), #D4AF37 (gold), #2C2C2C (dark gray)
- **Vibe**: Sophisticated, premium, breathing room
- **Diferenciador**: Refined shadows, generous spacing, luxury accessible

**Ubicación**: `/prototipo2`

---

## 📦 CARACTERÍSTICAS

Ambos prototipos incluyen:

✅ **Inventario**
- Búsqueda por nombre/SKU
- Filtrado por categoría
- Visualización de stock
- Grid responsivo

✅ **Carrito de Compra**
- Resumen de totales
- Cálculo de impuestos
- Interfaz limpia

✅ **Dashboard**
- Estadísticas de ventas
- Gráficas básicas
- Transacciones recientes

✅ **Responsive Design**
- Funciona en laptop y celular
- Animaciones smooth
- Reusable components

---

## 🚀 INSTALACIÓN Y USO

### **Prototipo 1 (Brutalist)**

```bash
cd prototipo1

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
# Abre http://localhost:5173

# Build para producción
npm run build
```

### **Prototipo 2 (Luxury)**

```bash
cd prototipo2

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
# Abre http://localhost:5174

# Build para producción
npm run build
```

---

## 🏗️ ARQUITECTURA

### SOLID Principles Aplicados

- **Single Responsibility**: Cada componente tiene una responsabilidad clara
- **Open/Closed**: Componentes extensibles sin modificar código existente
- **Liskov Substitution**: Props interfaces consistentes
- **Interface Segregation**: Componentes reciben solo props que usan
- **Dependency Inversion**: Datos mockeados (fácil cambiar a API)

### Componentes Reutilizables

```
Header          → Navegación, branding
Inventory       → Listado de productos, filtros
Cart            → Resumen de compra
Dashboard       → Estadísticas, análisis
```

### State Management

- React Hooks (useState, useEffect)
- Local state para simplicidad
- Fácil migrar a Context API o Redux si escala

---

## 🎨 PALETAS DE COLOR

### Prototipo 1 (Brutalist)
```css
--color-black: #000000
--color-white: #FFFFFF
--color-red: #FF4444
--color-dark-gray: #1a1a1a
```

### Prototipo 2 (Luxury)
```css
--color-white: #FFFFFF
--color-light-gray: #F8F8F8
--color-dark-gray: #2C2C2C
--color-gold: #D4AF37
```

---

## 📊 DATASET

Productos mockeados en cada componente (6 items de ejemplo):
- Nike Air Max - Zapatillas
- Black Hoodie - Urban Fit
- Adidas Ultraboost
- Red Oversized T-Shirt
- Cargo Pants
- Puma RS-X

**Ruta de datos**: `/data/products.json`

---

## 🔧 TECNOLOGÍA

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (ultra-fast)
- **CSS3** - Animations, Grid, Flexbox
- **Google Fonts** - Typography

---

## 📱 RESPONSIVE

Ambos prototipos son **100% responsive**:
- Desktop: Full layout, all features
- Tablet: Adapted grid, optimized spacing
- Mobile: Single column, touch-friendly

---

## ✨ CARACTERÍSTICAS ESPECIALES

### Prototipo 1 (Brutalist)
- Grid background pattern
- Scroll animations (stagger)
- Hover effects con scaling
- Punchy transitions (0.15s-0.3s)

### Prototipo 2 (Luxury)
- Subtle shadows y depth
- Smooth transitions (0.4s-0.6s)
- Breathing whitespace
- Gradient bars en dashboard

---

## 🚢 PRÓXIMAS FASES

- [ ] Integración de API real
- [ ] Sistema de pagos (Stripe/PayPal)
- [ ] Autenticación de usuarios
- [ ] Base de datos (Firebase/PostgreSQL)
- [ ] Generación de boletas/PDF
- [ ] Historial de transacciones
- [ ] Gestión de inventario avanzada
- [ ] Dashboard con gráficas reales

---

## 📝 NOTAS

- Ambos prototipos comparten la misma estructura (fácil mantener)
- CSS variables para theming consistente
- Componentes son plug-and-play
- Listo para agregar carrito global con Context/Redux
- Imágenes son de Pexels (placeholder)

---

## 👨‍💻 AUTOR

Desarrollado como prototipo MVP para MAINBO MODA
- Bryan Daniel Martínez Cabezas
- La Paz, Bolivia - Agosto 2026

---

**¡Listo para presentar a los clientes! 🎉**
