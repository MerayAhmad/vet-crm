import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  Users, 
  Target, 
  DollarSign, 
  CheckCircle, 
  Tag, 
  Activity, 
  X,
  Layers
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Product, ProductCategory } from '../types';
import { formatCurrency } from '../utils/helpers';
import { ProductModal } from './ProductModal';

interface ProductsListProps {
  onSelectCustomer: (customerId: string) => void;
  onOpenNewOpportunity: () => void;
}

export const ProductsList: React.FC<ProductsListProps> = ({
  onSelectCustomer,
  onOpenNewOpportunity,
}) => {
  const { products, customers, opportunities, sales } = useCrm();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Category filters (مبنية ديناميكياً من فئات المنتجات الموجودة)
  const categories: { key: string; label: string; count: number }[] = [
    { key: 'all', label: 'جميع الأدوية', count: products.length },
    ...Array.from(
      products.reduce((m, p) => {
        const cur = m.get(p.category);
        m.set(p.category, { label: cur?.label || p.categoryAr, count: (cur?.count || 0) + 1 });
        return m;
      }, new Map<string, { label: string; count: number }>())
    )
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, v]) => ({ key, label: v.label, count: v.count })),
  ];

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>دليل المنتجات والأدوية البيطرية</span>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {products.length} مستحضر دوائي
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            ربط الأدوية بالعملاء المهتمين، وتتبع فرص البيع والمبيعات لكل صنف
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة منتج جديد</span>
        </button>
      </div>

      {/* 2. Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث باسم الدواء، الكود، أو التركيب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pr-9 pl-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
                selectedCategory === c.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c.label} <span className="opacity-60 font-mono text-[10px]">({c.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => {
          // Interested customers count
          const interestedCustomers = customers.filter((c) =>
            c.interestedProducts.some((ip) => ip.productId === prod.id)
          );

          // Open opportunities count
          const prodOpportunities = opportunities.filter((o) => o.productId === prod.id);

          // Total sales amount
          const prodSales = sales.filter((s) => s.productId === prod.id);
          const totalSalesValue = prodSales.reduce((sum, s) => sum + s.totalAmount, 0);

          return (
            <div
              key={prod.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                {/* Product Name & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {prod.name}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {prod.code} · {prod.formAr}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {prod.categoryAr}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>

                {/* Target Animals & Packaging */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {prod.targetAnimals.map((animal, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                    >
                      {animal}
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-400">· {prod.packaging}</span>
                </div>
              </div>

              {/* CRM Product Stats */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">المهتمون</div>
                    <div className="text-sm font-bold text-slate-900 font-mono">
                      {interestedCustomers.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">الفرص المفتوحة</div>
                    <div className="text-sm font-bold text-amber-700 font-mono">
                      {prodOpportunities.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">المبيعات</div>
                    <div className="text-sm font-bold text-emerald-700 font-mono">
                      {formatCurrency(totalSalesValue)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="font-mono text-slate-700">
                    <span className="text-slate-400 text-[11px]">السعر التقريبي: </span>
                    <span className="font-bold text-slate-900">${prod.unitPrice}</span>
                  </div>

                  <button
                    onClick={() => setSelectedProductDetails(prod)}
                    className="px-3 py-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Details Slide/Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5 text-xs md:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-700" />
                <h2 className="font-extrabold text-base text-slate-900">
                  {selectedProductDetails.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block mb-1">الفئة والشكل الصيدلاني:</span>
                <span className="font-semibold text-slate-800">
                  {selectedProductDetails.categoryAr} · {selectedProductDetails.formAr} ({selectedProductDetails.packaging})
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">الوصف والاستطبابات البيطرية:</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedProductDetails.description}
                </p>
              </div>

              {selectedProductDetails.activeIngredients && selectedProductDetails.activeIngredients.length > 0 && (
                <div>
                  <span className="text-slate-400 block mb-1">المواد الفعالة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProductDetails.activeIngredients.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold text-xs">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-400 block mb-1">الحيوانات المستهدفة:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProductDetails.targetAnimals.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interested customers quick list */}
              <div className="pt-2">
                <span className="text-slate-400 block mb-2 font-bold">
                  العملاء المهتمون بهذا المستحضر:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5">
                  {customers
                    .filter((c) =>
                      c.interestedProducts.some((ip) => ip.productId === selectedProductDetails.id)
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedProductDetails(null);
                          onSelectCustomer(c.id);
                        }}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <span className="text-slate-500">{c.city} · {c.phone}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
