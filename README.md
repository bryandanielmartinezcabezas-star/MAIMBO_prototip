# MAINBO — Sistema de tienda

Cuatro prototipos de un mismo sistema para **MAINBO MODA** (Zona Mercado Campesino, Sucre).
Los cuatro hacen exactamente lo mismo y se ven completamente distinto: la idea es que
Guido y su esposa elijan la piel que sienten suya, no que elijan funciones.

Cada uno trae **Catálogo**, **Inventario** y **Gestión de ventas**, todos en tonos oscuros.

---

## Los cuatro

| Carpeta | Nombre | Cómo se siente | Puerto |
|---|---|---|---|
| `prototipo1` | **NEÓN** | Negro y verde eléctrico sacado de su logo cromado. Tipografía angular. El más "drip". | 5173 |
| `prototipo2` | **NOIR** | Editorial oscuro: serif grande, mucho aire, un solo acento cereza. Se siente marca. | 5174 |
| `prototipo3` | **BRUTAL** | Negro puro, rojo, monoespaciada, cero esquinas redondeadas. Crudo y directo. | 5175 |
| `prototipo4` | **OPERATIVO** | Pizarra y ámbar, denso, más información por pantalla. Para trabajar todo el día. | 5176 |

---

## Cómo levantarlos

```bash
cd prototipo1     # o prototipo2 / prototipo3 / prototipo4
npm install
npm run dev
```

Cada uno abre en su propio puerto, así que se pueden tener los cuatro corriendo
a la vez y saltar entre pestañas para comparar.

---

## Qué hace el sistema

**Catálogo** — 47 modelos con foto, marca, categoría, precio en bolivianos y stock
por talla. Buscador por nombre, marca o código; filtros por categoría; orden por
precio o nombre. Las tallas agotadas se muestran tachadas en vez de esconderse,
para poder responder al toque "¿hay en 42?".

**Inventario** — la misma mercadería vista desde el mostrador: cuántas unidades
hay, cuánto costó, cuánto vale a precio de venta y cuánto es el margen. Alta,
edición y baja de productos, stock talla por talla, y un panel de **reposición
sugerida** que junta lo agotado y lo que está por acabarse.

**Gestión de ventas** — ingresos, ganancia, ticket promedio y prendas vendidas,
con rango de hoy / 7 días / todo. Gráfico de los últimos siete días, ranking de
más vendidos, reparto por forma de pago e historial completo de boletas.

**Ticket y cobro** — el ticket vive al costado del catálogo, como una caja de
verdad: se agrega, se ajusta cantidad, se aplica descuento y se cobra. Al cobrar
se descuenta el stock solo y la venta aparece en el historial.

**Boleta en PDF** — formato rollo de 80 mm con los datos reales del negocio,
número correlativo, detalle con talla y precio unitario, y el IVA desglosado.
Se puede descargar o mandar directo a imprimir.

---

## Detalles que importan

- **Precios en bolivianos con IVA incluido.** El 13% se desglosa *hacia adentro*
  del total (`total × 13/113`), que es como funciona una boleta boliviana — no se
  suma encima del precio de vitrina.
- **Funciona sin internet.** Las 47 fotos están dentro del proyecto. En el puesto,
  con señal mala, sigue andando igual.
- **Los datos aguantan el refresco.** Todo se guarda en el navegador; se puede
  cerrar y volver a abrir sin perder nada.
- **La demo siempre está viva.** Los datos de ejemplo se regeneran solos si son de
  un día anterior, así el panel nunca aparece en cero. El botón *Reiniciar demo*
  vuelve todo al estado inicial.
- **Anda en celular.** En pantalla chica el ticket pasa a ser un cajón y la
  navegación baja al pulgar.

---

## Cómo está armado por dentro

Los cuatro prototipos comparten el mismo núcleo. Lo único que cambia entre ellos
son dos archivos: `src/styles/theme.css` y `src/config/theme.ts`.

```
src/
├── domain/       tipos y reglas de dinero (IVA, formato Bs)
├── services/     lógica pura, sin React: inventario, carrito, boleta, análisis
├── store/        estado de React que conecta esos servicios con la pantalla
├── components/
│   ├── ui/       piezas reutilizables: Button, Modal, Field, Badge, StatTile…
│   └── features/ las tres vistas más el ticket
└── styles/
    ├── base.css  estructura y layout, compartido por los cuatro
    └── theme.css color, tipografía y textura ← lo único propio de cada piel
```

Los servicios no saben que existe React y las vistas no saben cómo se guardan los
datos. Por eso cambiar `localStorage` por un servidor de verdad, más adelante, es
tocar un solo archivo.

**Stack:** React 18 · TypeScript · Vite · jsPDF · CSS a mano.

---

## Lo que sigue, si les gusta

- Servidor propio para que el inventario se comparta entre la tienda y el celular
- Pagos con QR enlazados al banco
- Facturación fiscal con el SIN
- Catálogo público para vender en línea con envíos a toda Bolivia
- Cuentas separadas para cada persona que atiende

---

Sucre, Bolivia · agosto 2026
