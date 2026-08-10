import type {
  ArticuloItem,
  ChatMessage,
  DepositoMock,
  Kpi,
  ListaPrecios,
  LowStockItem,
  Presupuesto,
  Producto,
  Proveedor,
  Renglon,
  Usuario,
  Venta,
} from '../types/domain'

export const mockUsuario: Usuario = {
  id: '00000000-0000-0000-0000-000000000001',
  nombre: 'Marcos',
  apellido: 'Ruiz',
  username: 'mruiz',
  email: 'mruiz@ferrestock.com',
  rol: 'Administrador',
}

export const kpis: Kpi[] = [
  { label: 'Artículos en stock', value: '1.842', delta: '+12 esta semana', color: '#4A6B8A', icon: '📦' },
  { label: 'Ventas del mes', value: '$284.500', delta: '+8% vs mes anterior', color: '#C8763A', icon: '💰' },
  { label: 'Órdenes pendientes', value: '34', delta: '6 vencen hoy', color: '#A05C7B', icon: '🕐' },
  { label: 'Stock bajo mínimo', value: '27', delta: 'Requiere reposición', color: '#7B9A4A', icon: '⚠️' },
]

export const recentSales: { id: string; client: string; items: number; total: string; status: string }[] = [
  { id: 'V-0091', client: 'Constructora Norte', items: 14, total: '$18.400', status: 'Entregado' },
  { id: 'V-0090', client: 'Juan Pérez', items: 3, total: '$2.150', status: 'Pendiente' },
  { id: 'V-0089', client: 'Refac. El Pinar', items: 8, total: '$9.800', status: 'Entregado' },
  { id: 'V-0088', client: 'Electricidad Vera', items: 22, total: '$31.600', status: 'En camino' },
  { id: 'V-0087', client: 'Pablo Méndez', items: 1, total: '$480', status: 'Entregado' },
]

export const lowStock: LowStockItem[] = [
  { name: 'Tornillo autorroscante 1"', stock: 42, min: 200, unit: 'unid.' },
  { name: 'Cinta de teflón x 10m', stock: 8, min: 50, unit: 'unid.' },
  { name: 'Lija grano 120 (pliego)', stock: 15, min: 100, unit: 'unid.' },
  { name: 'Cable unipolar 2.5mm rojo', stock: 12, min: 50, unit: 'mt.' },
]

export const statusColor: Record<string, string> = {
  Entregado: '#7B9A4A',
  Pendiente: '#C8763A',
  'En camino': '#4A6B8A',
}

export const productCategories = ['Todos', 'Fijaciones', 'Electricidad', 'Plomería', 'Herramientas', 'Pinturas', 'Maderas']

export const products: ArticuloItem[] = [
  { code: 'A-001', name: 'Tornillo autorroscante 1"', cat: 'Fijaciones', stock: 42, unit: 'unid.', cost: 12, price: 18, deposit: 'Principal', min: 200 },
  { code: 'A-002', name: 'Tornillo hex 3/8 x 2"', cat: 'Fijaciones', stock: 380, unit: 'unid.', cost: 25, price: 40, deposit: 'Principal', min: 150 },
  { code: 'B-001', name: 'Cable unipolar 2.5mm rojo', cat: 'Electricidad', stock: 12, unit: 'mt.', cost: 90, price: 140, deposit: 'Eléctrico', min: 50 },
  { code: 'B-002', name: 'Disyuntor bipolar 32A', cat: 'Electricidad', stock: 24, unit: 'unid.', cost: 1200, price: 1900, deposit: 'Eléctrico', min: 10 },
  { code: 'C-001', name: 'Cinta de teflón x 10m', cat: 'Plomería', stock: 8, unit: 'unid.', cost: 95, price: 150, deposit: 'Principal', min: 50 },
  { code: 'C-002', name: 'Caño de cobre 1/2" x 3m', cat: 'Plomería', stock: 60, unit: 'unid.', cost: 850, price: 1250, deposit: 'Principal', min: 20 },
  { code: 'D-001', name: 'Martillo carpintero 20oz', cat: 'Herramientas', stock: 15, unit: 'unid.', cost: 2200, price: 3400, deposit: 'Principal', min: 5 },
  { code: 'D-002', name: 'Lija grano 120 (pliego)', cat: 'Herramientas', stock: 15, unit: 'unid.', cost: 45, price: 75, deposit: 'Principal', min: 100 },
  { code: 'E-001', name: 'Pintura látex blanca 4L', cat: 'Pinturas', stock: 32, unit: 'unid.', cost: 2800, price: 4200, deposit: 'Pinturas', min: 10 },
  { code: 'F-001', name: 'Tablón pino 1" x 10" x 3m', cat: 'Maderas', stock: 18, unit: 'unid.', cost: 3500, price: 5200, deposit: 'Maderas', min: 8 },
]

export const deposits: DepositoMock[] = [
  {
    name: 'Depósito Principal',
    location: 'Planta baja, sector A',
    capacity: 85,
    items: 842,
    manager: 'Carlos Gómez',
    categories: ['Fijaciones', 'Plomería', 'Herramientas', 'Pinturas'],
  },
  {
    name: 'Depósito Eléctrico',
    location: 'Planta alta, sector B',
    capacity: 60,
    items: 234,
    manager: 'Laura Sánchez',
    categories: ['Electricidad', 'Iluminación'],
  },
  {
    name: 'Depósito Maderas',
    location: 'Galpón externo',
    capacity: 45,
    items: 98,
    manager: 'Roberto Díaz',
    categories: ['Maderas', 'Aberturas'],
  },
  {
    name: 'Depósito Pinturas',
    location: 'Planta baja, sector C',
    capacity: 70,
    items: 320,
    manager: 'Ana Torres',
    categories: ['Pinturas', 'Impermeabilizantes'],
  },
]

export const ventas: Venta[] = [
  { id: 'V-0091', date: '09/08/2026', client: 'Constructora Norte S.A.', items: 14, total: 18400, status: 'Entregado', payment: 'Cuenta corriente' },
  { id: 'V-0090', date: '09/08/2026', client: 'Juan Pérez', items: 3, total: 2150, status: 'Pendiente', payment: 'Efectivo' },
  { id: 'V-0089', date: '08/08/2026', client: 'Refaccionaria El Pinar', items: 8, total: 9800, status: 'Entregado', payment: 'Transferencia' },
  { id: 'V-0088', date: '08/08/2026', client: 'Electricidad Vera', items: 22, total: 31600, status: 'En camino', payment: 'Cuenta corriente' },
  { id: 'V-0087', date: '07/08/2026', client: 'Pablo Méndez', items: 1, total: 480, status: 'Entregado', payment: 'Efectivo' },
  { id: 'V-0086', date: '07/08/2026', client: 'Municipio de Rosario', items: 45, total: 68200, status: 'Entregado', payment: 'Cheque' },
  { id: 'V-0085', date: '06/08/2026', client: 'Estudio Arquitectura Paz', items: 12, total: 24300, status: 'En camino', payment: 'Transferencia' },
]

export const salesStatuses = ['Todos', 'Pendiente', 'En camino', 'Entregado']

export const proveedores: Proveedor[] = [
  { id: 'P-01', name: 'Distribuidora MetalSur', contact: 'Jorge Blanco', email: 'jblanco@metalsur.com', phone: '0341-4820011', categories: ['Fijaciones', 'Herramientas'], lastOrder: '02/08/2026', balance: -12400, rating: 5 },
  { id: 'P-02', name: 'Electro Insumos SRL', contact: 'María Figueroa', email: 'mfigueroa@electroinsumos.com', phone: '011-4523-9900', categories: ['Electricidad'], lastOrder: '05/08/2026', balance: 0, rating: 4 },
  { id: 'P-03', name: 'Maderas del Litoral', contact: 'Santiago Ríos', email: 'srios@maderlit.com', phone: '0342-4710083', categories: ['Maderas'], lastOrder: '28/07/2026', balance: -5200, rating: 4 },
  { id: 'P-04', name: 'Pinturas Acolore', contact: 'Verónica Cruz', email: 'vcruz@acolore.com', phone: '011-4655-0012', categories: ['Pinturas'], lastOrder: '01/08/2026', balance: 0, rating: 5 },
  { id: 'P-05', name: 'Plomería Del Norte', contact: 'Héctor Aguirre', email: 'haguirre@pldelnorte.com', phone: '0341-5520099', categories: ['Plomería'], lastOrder: '06/08/2026', balance: -3800, rating: 3 },
]

export const listasPrecios: ListaPrecios[] = [
  { id: 'L-1', name: 'Lista Minorista', description: 'Clientes finales y particulares', multiplier: 1.0, items: 420, updated: '01/08/2026', active: true },
  { id: 'L-2', name: 'Lista Mayorista', description: 'Revendedores y comercios', multiplier: 0.85, items: 420, updated: '01/08/2026', active: true },
  { id: 'L-3', name: 'Lista Constructoras', description: 'Empresas con acuerdo de volumen', multiplier: 0.78, items: 380, updated: '28/07/2026', active: true },
  { id: 'L-4', name: 'Lista Municipios', description: 'Organismos estatales', multiplier: 0.72, items: 200, updated: '15/07/2026', active: false },
]

export const priceListSample: Producto[] = [
  { code: 'A-001', name: 'Tornillo autorroscante 1"', base: 18 },
  { code: 'B-002', name: 'Disyuntor bipolar 32A', base: 1900 },
  { code: 'C-002', name: 'Caño de cobre 1/2" x 3m', base: 1250 },
  { code: 'D-001', name: 'Martillo carpintero 20oz', base: 3400 },
  { code: 'E-001', name: 'Pintura látex blanca 4L', base: 4200 },
]

export const presupuestos: Presupuesto[] = [
  { id: 'P-0044', client: 'Constructora Norte S.A.', date: '08/08/2026', expiry: '22/08/2026', total: 48600, items: 18, status: 'Enviado' },
  { id: 'P-0043', client: 'Estudio Arquitectura Paz', date: '07/08/2026', expiry: '21/08/2026', total: 24300, items: 12, status: 'Aprobado' },
  { id: 'P-0042', client: 'Municipio de Rosario', date: '05/08/2026', expiry: '19/08/2026', total: 112400, items: 45, status: 'Aprobado' },
  { id: 'P-0041', client: 'Juan Pérez', date: '04/08/2026', expiry: '18/08/2026', total: 3800, items: 4, status: 'Vencido' },
  { id: 'P-0040', client: 'Electricidad Vera', date: '01/08/2026', expiry: '15/08/2026', total: 31600, items: 22, status: 'Aprobado' },
]

export const budgetStatusColor: Record<string, string> = {
  Enviado: '#4A6B8A',
  Aprobado: '#7B9A4A',
  Vencido: '#C85A3A',
  Borrador: '#C8763A',
}

export const lineItems: Renglon[] = [
  { code: 'B-001', name: 'Cable unipolar 2.5mm rojo', qty: 50, unit: 'mt.', price: 140, subtotal: 7000 },
  { code: 'B-002', name: 'Disyuntor bipolar 32A', qty: 4, unit: 'unid.', price: 1900, subtotal: 7600 },
  { code: 'A-002', name: 'Tornillo hex 3/8 x 2"', qty: 200, unit: 'unid.', price: 40, subtotal: 8000 },
  { code: 'D-001', name: 'Martillo carpintero 20oz', qty: 2, unit: 'unid.', price: 3400, subtotal: 6800 },
]

export const budgetStatuses = ['Enviado', 'Aprobado', 'Vencido', 'Borrador']

export const assistantSuggestions = [
  '¿Qué artículos tienen stock bajo mínimo?',
  '¿Cuáles son los productos más vendidos este mes?',
  '¿Tengo tornillos similares al A-001?',
  '¿Qué debería reponer urgente?',
  '¿Cuánto gasté en compras a MetalSur este año?',
]

export const assistantInitialMessages: ChatMessage[] = [
  {
    role: 'assistant',
    text: '¡Hola! Soy el asistente de inventario de FerreStock. Puedo ayudarte a consultar stock, encontrar productos similares, detectar artículos a reponer y más. ¿En qué te ayudo hoy?',
  },
]
