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

export type Venta = {
  id: string
  date: string
  client: string
  items: number
  total: number
  status: 'Entregado' | 'Pendiente' | 'En camino'
  payment: string
}

export type VentaStatus = Venta['status']

export type Proveedor = {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  categories: string[]
  lastOrder: string
  balance: number
  rating: number
}

export type ListaPrecios = {
  id: string
  name: string
  description: string
  multiplier: number
  items: number
  updated: string
  active: boolean
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

export type Producto = {
  code: string
  name: string
  base: number
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
