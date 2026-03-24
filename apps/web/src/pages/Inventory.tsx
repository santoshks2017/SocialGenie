import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, Filter, MoreHorizontal, PlusSquare, CheckSquare, Pencil, Trash2, Zap, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { inventoryService } from '../services/creative';

type VehicleStatus = 'in_stock' | 'sold' | 'reserved';
type Condition = 'new' | 'used';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  condition: Condition;
  color: string;
  fuel_type: string;
  stock_count: number;
  status: VehicleStatus;
  image_url: string;
}

const MOCK_VEHICLES: Vehicle[] = [
  { id: '1', make: 'Hyundai', model: 'Creta', variant: 'SX(O) Turbo', year: 2024, price: 1999000, condition: 'new', color: 'Abyss Black', fuel_type: 'Petrol', stock_count: 3, status: 'in_stock', image_url: 'from-blue-900 to-blue-700' },
  { id: '2', make: 'Maruti Suzuki', model: 'Brezza', variant: 'Alpha', year: 2024, price: 1399000, condition: 'new', color: 'Pearl Arctic White', fuel_type: 'Petrol', stock_count: 5, status: 'in_stock', image_url: 'from-gray-700 to-gray-500' },
  { id: '3', make: 'Tata', model: 'Nexon EV', variant: 'Max XZ+', year: 2023, price: 1849000, condition: 'new', color: 'Flame Red', fuel_type: 'Electric', stock_count: 2, status: 'in_stock', image_url: 'from-red-700 to-red-500' },
  { id: '4', make: 'Kia', model: 'Sonet', variant: 'HTX+', year: 2024, price: 1299000, condition: 'new', color: 'Imperial Blue', fuel_type: 'Diesel', stock_count: 4, status: 'in_stock', image_url: 'from-indigo-800 to-indigo-600' },
  { id: '5', make: 'Hyundai', model: 'i20', variant: 'Asta (O)', year: 2023, price: 980000, condition: 'used', color: 'Typhoon Silver', fuel_type: 'Petrol', stock_count: 1, status: 'in_stock', image_url: 'from-slate-600 to-slate-400' },
  { id: '6', make: 'Maruti Suzuki', model: 'Swift', variant: 'ZXi+', year: 2022, price: 720000, condition: 'used', color: 'Solid Red', fuel_type: 'Petrol', stock_count: 1, status: 'in_stock', image_url: 'from-rose-700 to-rose-500' },
  { id: '7', make: 'Toyota', model: 'Fortuner', variant: 'Legender 4x2 AT', year: 2024, price: 4750000, condition: 'new', color: 'White Pearl Crystal Shine', fuel_type: 'Diesel', stock_count: 1, status: 'reserved', image_url: 'from-amber-700 to-amber-500' },
  { id: '8', make: 'Honda', model: 'City', variant: 'ZX CVT', year: 2022, price: 1150000, condition: 'used', color: 'Lunar Silver Metallic', fuel_type: 'Petrol', stock_count: 1, status: 'sold', image_url: 'from-zinc-600 to-zinc-400' },
];

const STATUS_STYLES: Record<VehicleStatus, string> = {
  in_stock: 'bg-green-100 text-green-700',
  sold: 'bg-gray-100 text-gray-500',
  reserved: 'bg-yellow-100 text-yellow-700',
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
  in_stock: 'In Stock',
  sold: 'Sold',
  reserved: 'Reserved',
};

function formatPrice(p: number) {
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p.toLocaleString('en-IN')}`;
}

const GRADIENTS = [
  'from-blue-900 to-blue-700', 'from-gray-700 to-gray-500', 'from-red-700 to-red-500',
  'from-indigo-800 to-indigo-600', 'from-slate-600 to-slate-400', 'from-rose-700 to-rose-500',
  'from-amber-700 to-amber-500', 'from-zinc-600 to-zinc-400', 'from-teal-700 to-teal-500',
];

function makeGradient(make: string) {
  const idx = make.charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[idx] ?? GRADIENTS[0]!;
}

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];
const EMPTY_FORM = {
  make: '', model: '', variant: '', year: new Date().getFullYear(),
  price: 0, condition: 'new' as Condition, color: '', fuel_type: '', stock_count: 1,
};

export default function InventoryPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState<'all' | Condition>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | VehicleStatus>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState<'drop' | 'mapping' | 'confirm'>('drop');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState(EMPTY_FORM);
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    inventoryService.list({ pageSize: 100 }).then((res) => {
      const mapped: Vehicle[] = res.items.map((item) => ({
        id: item.id,
        make: item.make,
        model: item.model,
        variant: item.variant ?? '',
        year: item.year,
        price: item.price,
        condition: item.condition,
        color: item.color ?? '',
        fuel_type: item.fuelType ?? '',
        stock_count: item.stockCount,
        status: item.status,
        image_url: makeGradient(item.make),
      }));
      if (mapped.length > 0) setVehicles(mapped);
    }).catch(console.error);
  }, []);

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${v.make} ${v.model} ${v.variant}`.toLowerCase().includes(q);
    const matchCond = filterCondition === 'all' || v.condition === filterCondition;
    const matchStat = filterStatus === 'all' || v.status === filterStatus;
    return matchSearch && matchCond && matchStat;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const markSold = (id: string) => {
    inventoryService.markSold(id).catch(console.error);
    setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, status: 'sold' } : v));
  };

  const deleteVehicle = (id: string) => {
    inventoryService.delete(id).catch(console.error);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const openAdd = () => {
    setEditingVehicle(null);
    setVehicleForm(EMPTY_FORM);
    setShowVehicleModal(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setVehicleForm({ make: v.make, model: v.model, variant: v.variant, year: v.year, price: v.price, condition: v.condition, color: v.color, fuel_type: v.fuel_type, stock_count: v.stock_count });
    setShowVehicleModal(true);
  };

  const setField = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) =>
    setVehicleForm((prev) => ({ ...prev, [key]: value }));

  const handleVehicleSave = async () => {
    if (!vehicleForm.make || !vehicleForm.model) return;
    setVehicleSaving(true);
    try {
      const payload = {
        make: vehicleForm.make,
        model: vehicleForm.model,
        variant: vehicleForm.variant || undefined,
        year: vehicleForm.year,
        price: vehicleForm.price,
        condition: vehicleForm.condition,
        color: vehicleForm.color || undefined,
        fuelType: vehicleForm.fuel_type || undefined,
        stockCount: vehicleForm.stock_count,
        imageUrls: [],
        status: 'in_stock' as const,
        source: 'manual' as const,
      };
      if (editingVehicle) {
        await inventoryService.update(editingVehicle.id, payload);
        setVehicles((prev) => prev.map((v) => v.id === editingVehicle.id
          ? { ...v, ...vehicleForm, image_url: makeGradient(vehicleForm.make) }
          : v));
      } else {
        const res = await inventoryService.create({ dealerId: '', ...payload });
        const item = res.item;
        setVehicles((prev) => [...prev, {
          id: item.id, make: item.make, model: item.model, variant: item.variant ?? '',
          year: item.year, price: item.price, condition: item.condition,
          color: item.color ?? '', fuel_type: item.fuelType ?? '',
          stock_count: item.stockCount, status: item.status,
          image_url: makeGradient(item.make),
        }]);
      }
      setShowVehicleModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setVehicleSaving(false);
    }
  };

  const bulkMarkSold = async () => {
    const ids = [...selected];
    await Promise.allSettled(ids.map((id) => inventoryService.markSold(id)));
    setVehicles((prev) => prev.map((v) => selected.has(v.id) ? { ...v, status: 'sold' } : v));
    setSelected(new Set());
    addToast({ type: 'success', title: `${ids.length} vehicle${ids.length > 1 ? 's' : ''} marked as sold` });
  };

  const bulkDelete = async () => {
    const ids = [...selected];
    await Promise.allSettled(ids.map((id) => inventoryService.delete(id)));
    setVehicles((prev) => prev.filter((v) => !selected.has(v.id)));
    setSelected(new Set());
    addToast({ type: 'success', title: `${ids.length} vehicle${ids.length > 1 ? 's' : ''} deleted` });
  };

  const bulkGeneratePost = () => {
    const ids = [...selected];
    const names = vehicles.filter((v) => selected.has(v.id)).map((v) => `${v.make} ${v.model}`).join(', ');
    navigate(`/create?prompt=Showcase+these+vehicles+for+sale:+${encodeURIComponent(names)}`);
    setSelected(new Set());
  };

  const inStock = vehicles.filter((v) => v.status === 'in_stock').length;
  const sold = vehicles.filter((v) => v.status === 'sold').length;
  const newCount = vehicles.filter((v) => v.condition === 'new').length;
  const usedCount = vehicles.filter((v) => v.condition === 'used').length;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-500 mt-0.5">{inStock} in stock · {sold} sold · {newCount} new · {usedCount} used</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="text-sm flex items-center gap-1.5" onClick={() => { setShowUploadModal(true); setUploadStep('drop'); }}>
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button className="text-sm flex items-center gap-1.5" onClick={openAdd}>
            <PlusSquare className="w-4 h-4" /> Add Vehicle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by make, model, variant..."
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-1.5 border rounded-lg p-1">
          <Filter className="w-3.5 h-3.5 text-gray-400 ml-1" />
          {(['all', 'new', 'used'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilterCondition(c)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${filterCondition === c ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 border rounded-lg p-1">
          {(['all', 'in_stock', 'reserved', 'sold'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {s === 'all' ? 'All Status' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
          <span className="text-sm font-medium text-blue-700">{selected.size} selected</span>
          <button onClick={bulkMarkSold} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Mark Sold</button>
          <button onClick={bulkGeneratePost} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Generate Showcase Post</button>
          <button onClick={bulkDelete} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
          <button className="ml-auto text-xs text-gray-500" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={() => {
                      if (selected.size === filtered.length) setSelected(new Set());
                      else setSelected(new Set(filtered.map((v) => v.id)));
                    }}
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Condition</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((v) => (
                <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${selected.has(v.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded" checked={selected.has(v.id)} onChange={() => toggleSelect(v.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-9 rounded-lg bg-gradient-to-br ${v.image_url} flex-shrink-0`} />
                      <div>
                        <p className="font-semibold text-gray-900">{v.make} {v.model}</p>
                        <p className="text-xs text-gray-500">{v.variant} · {v.year} · {v.color}</p>
                        <p className="text-xs text-gray-400">{v.fuel_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.condition === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {v.condition === 'new' ? 'New' : 'Used'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(v.price)}</td>
                  <td className="px-4 py-3 text-gray-600">{v.stock_count} unit{v.stock_count !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[v.status]}`}>
                      {STATUS_LABELS[v.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        title="Generate Post"
                        onClick={() => {
                          const p = `${v.condition === 'new' ? 'New arrival' : 'Pre-owned'}: ${v.year} ${v.make} ${v.model}${v.variant ? ' ' + v.variant : ''} — ${formatPrice(v.price)}. ${v.stock_count} unit${v.stock_count !== 1 ? 's' : ''} available${v.color ? ', ' + v.color : ''}.`;
                          navigate('/create?prompt=' + encodeURIComponent(p));
                        }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button title="Edit" onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {v.status !== 'sold' && (
                        <button title="Mark as Sold" onClick={() => markSold(v.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      )}
                      <button title="Delete" onClick={() => deleteVehicle(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    <div className="text-4xl mb-2">🚗</div>
                    <p className="font-medium text-gray-500">No vehicles found</p>
                    <p className="text-sm mt-1">Try adjusting filters or import a CSV</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-between text-xs text-gray-500">
          <span>Showing {filtered.length} of {vehicles.length} vehicles</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded border hover:bg-gray-50">Prev</button>
            <button className="px-2 py-1 rounded border bg-blue-600 text-white">1</button>
            <button className="px-2 py-1 rounded border hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Add / Edit Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
              <button onClick={() => setShowVehicleModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Make <span className="text-red-500">*</span></label>
                <input
                  value={vehicleForm.make}
                  onChange={(e) => setField('make', e.target.value)}
                  placeholder="e.g. Hyundai"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Model <span className="text-red-500">*</span></label>
                <input
                  value={vehicleForm.model}
                  onChange={(e) => setField('model', e.target.value)}
                  placeholder="e.g. Creta"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-medium text-gray-700">Variant</label>
                <input
                  value={vehicleForm.variant}
                  onChange={(e) => setField('variant', e.target.value)}
                  placeholder="e.g. SX(O) Turbo"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Year <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={vehicleForm.year}
                  onChange={(e) => setField('year', Number(e.target.value))}
                  min={1980} max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Price (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={vehicleForm.price}
                  onChange={(e) => setField('price', Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Condition <span className="text-red-500">*</span></label>
                <select
                  value={vehicleForm.condition}
                  onChange={(e) => setField('condition', e.target.value as Condition)}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Fuel Type</label>
                <select
                  value={vehicleForm.fuel_type}
                  onChange={(e) => setField('fuel_type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Color</label>
                <input
                  value={vehicleForm.color}
                  onChange={(e) => setField('color', e.target.value)}
                  placeholder="e.g. Pearl White"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Stock Count <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={vehicleForm.stock_count}
                  onChange={(e) => setField('stock_count', Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="secondary" className="flex-1 text-sm" onClick={() => setShowVehicleModal(false)}>Cancel</Button>
              <Button
                className="flex-1 text-sm"
                onClick={handleVehicleSave}
                disabled={vehicleSaving || !vehicleForm.make || !vehicleForm.model}
              >
                {vehicleSaving ? 'Saving...' : editingVehicle ? 'Save Changes' : 'Add Vehicle'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Import Inventory</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {['Upload File', 'Map Columns', 'Confirm'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === (['drop','mapping','confirm'] as const).indexOf(uploadStep) ? 'bg-blue-600 text-white' :
                    i < (['drop','mapping','confirm'] as const).indexOf(uploadStep) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>{i + 1}</div>
                  <span className="text-xs text-gray-500">{s}</span>
                  {i < 2 && <div className="w-6 h-px bg-gray-200" />}
                </div>
              ))}
            </div>

            {uploadStep === 'drop' && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); setUploadStep('mapping'); }}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-700">Drop CSV or Excel file here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                <p className="text-xs text-gray-300 mt-3">Supports .csv, .xlsx, .xls · Max 500 rows</p>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={() => setUploadStep('mapping')} />
              </div>
            )}

            {uploadStep === 'mapping' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Map your file columns to Cardeko fields:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {[
                    { field: 'Make', yourCol: 'Brand', required: true },
                    { field: 'Model', yourCol: 'Model Name', required: true },
                    { field: 'Variant', yourCol: 'Variant/Trim', required: false },
                    { field: 'Year', yourCol: 'Year of Manufacture', required: true },
                    { field: 'Price', yourCol: 'Selling Price', required: true },
                    { field: 'Condition', yourCol: 'New/Used', required: true },
                    { field: 'Image URL', yourCol: 'Image Link', required: false },
                  ].map((m) => (
                    <div key={m.field} className="flex items-center gap-3">
                      <div className="w-28 text-xs font-medium text-gray-700">
                        {m.field} {m.required && <span className="text-red-500">*</span>}
                      </div>
                      <select className="flex-1 text-xs border rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value={m.yourCol}>{m.yourCol}</option>
                        <option value="">-- Skip --</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1 text-sm" onClick={() => setUploadStep('drop')}>Back</Button>
                  <Button className="flex-1 text-sm" onClick={() => setUploadStep('confirm')}>Validate</Button>
                </div>
              </div>
            )}

            {uploadStep === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-800">Ready to import</p>
                  <p className="text-sm text-green-700 mt-1">47 vehicles · 0 errors · 3 warnings</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
                  3 rows have missing Image URLs — a placeholder will be used.
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Import mode:</p>
                  <div className="flex gap-2">
                    {['Append', 'Update existing', 'Replace all'].map((m) => (
                      <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="mode" defaultChecked={m === 'Update existing'} />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1 text-sm" onClick={() => setUploadStep('mapping')}>Back</Button>
                  <Button className="flex-1 text-sm" onClick={() => setShowUploadModal(false)}>Confirm Import</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
