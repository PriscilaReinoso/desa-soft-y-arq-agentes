export type Usuario = {
  id: string
  nombre: string
  apellido: string
  username: string
  email: string
  rol: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
  usuario: Usuario
}

export type Categoria = {
  id: string
  nombre: string
  descripcion: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Medida = {
  id: string
  unidad_medida: string
  medida: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Articulo = {
  id: string
  nombre: string
  descripcion: string | null
  categoria_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Deposito = {
  id: string
  nombre: string
  descripcion: string | null
  direccion: string | null
  cantidad_espacios: number
  espacios?: Espacio[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Espacio = {
  id: string
  tipo: string | null
  descripcion: string | null
  deposito_id: string
  max_fila: number | null
  max_columna: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type ArticuloConCategoria = Articulo & {
  categoria: Categoria
}

export type EspacioConDeposito = Espacio & {
  deposito: Deposito
}

export type InventarioOut = {
  id: string
  fila: number | null
  columna: number | null
  stock: number
  minimo_stock: number
  precio_venta: number
  articulo: ArticuloConCategoria
  medida: Medida
  medida_venta: Medida | null
  espacio: EspacioConDeposito | null
}

export type InventarioRow = {
  id: string
  categoria: string
  articulo: string
  medida: string
  deposito: string | null
  espacio: string | null
  fila: number | null
  columna: number | null
  stock: number
  minimo_stock: number
  medida_venta: string | null
  bajo_minimo: boolean
  precio_venta: number
}

export type ArticuloAltaPayload = {
  id?: string
  nombre?: string
  descripcion?: string | null
  categoria_id?: string
}

export type MedidaAltaPayload = {
  id?: string
  unidad_medida?: string
  medida?: string
}

export type EspacioAltaPayload = {
  id?: string
  deposito_id?: string
  tipo?: string | null
  descripcion?: string | null
  max_fila?: number | null
  max_columna?: number | null
}

export type InventarioAltaPayload = {
  articulo: ArticuloAltaPayload
  medida: MedidaAltaPayload
  espacio?: EspacioAltaPayload | null
  fila?: number | null
  columna?: number | null
  stock: number
  minimo_stock?: number
  precio_venta: number
  medida_venta_id?: string | null
}

export type Kpi = {
  label: string
  value: string
  delta: string
  color: string
  icon: string
}

export type Proveedor = {
  id: string
  nombre: string
  apellido: string
  telefono: string
  direccion: string | null
  categorias: Categoria[]
}

export type ProveedorCreatePayload = {
  nombre: string
  apellido: string
  telefono: string
  direccion?: string | null
  categoria_ids?: string[]
}

export type ProveedorUpdatePayload = {
  nombre?: string
  apellido?: string
  telefono?: string
  direccion?: string | null
  categoria_ids?: string[]
}

export type ListaPrecioOut = {
  id: string
  articulo: Articulo
  medida: Medida
  proveedor: Proveedor
  id_articulo_proveedor: string | null
  precio_lista: number
}

export type CantidadListaPorProveedor = {
  proveedor: Proveedor
  cantidad: number
}

export type ItemListaPrecioPayload = {
  articulo: ArticuloAltaPayload
  medida: MedidaAltaPayload
  id_articulo_proveedor?: string | null
  precio_lista: number
}

export type ListaPreciosAltaPayload = {
  proveedor_id?: string | null
  proveedor?: ProveedorCreatePayload | null
  items: ItemListaPrecioPayload[]
}

export type ListaPreciosUpdatePayload = {
  precio_lista: number
  id_articulo_proveedor?: string | null
}

export type MapeoColumna = {
  key: string
  value: string
}

export type MetodoPago = {
  id: string
  nombre: string
  descripcion: string | null
}

export type ItemVentaPayload = {
  inventario_id: string
  cantidad: number
  metodo_pago_id?: string | null
}

export type VentaCreatePayload = {
  items: ItemVentaPayload[]
  aprobado: boolean
  cliente?: string | null
  presupuesto_id?: string | null
}

export type VentaUpdatePayload = {
  items?: ItemVentaPayload[]
  aprobado?: boolean
  cliente?: string | null
  presupuesto_id?: string | null
}

export type VentaDetalleOut = {
  id: string
  articulo: Articulo
  medida: Medida
  cantidad: number
  precio_venta: string
  sub_total: string
  metodo_pago_id: string | null
}

export type VentaOut = {
  id: string
  fecha: string
  numero: number
  cantidad: number
  total: string
  cliente: string | null
  aprobado: boolean
  presupuesto_id: string | null
  detalles: VentaDetalleOut[]
}

export type PeriodoVentas = 'dia' | 'semana' | 'mes' | 'anio'

export type ResumenVentasOut = {
  periodo: PeriodoVentas
  desde: string
  hasta: string
  total: string
  cantidad_ventas: number
}

export type Presupuesto = {
  id: string
  client: string
  date: string
  expiry: string
  total: number
  items: number
  status: string
}

export type Renglon = {
  code: string
  name: string
  qty: number
  unit: string
  price: number
  subtotal: number
}

export type ArticuloItem = {
  code: string
  name: string
  cat: string
  stock: number
  unit: string
  cost: number
  price: number
  deposit: string
  min: number
}

export type DepositoMock = {
  name: string
  location: string
  capacity: number
  items: number
  manager: string
  categories: string[]
}

export type LowStockItem = {
  name: string
  stock: number
  min: number
  unit: string
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
}
