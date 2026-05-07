import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/store/useCartStore';
import type { CartProduct } from '@/store/useCartStore';
import { useReactToPrint } from 'react-to-print';
import api from '@/lib/api';
import ReceiptPrint from '@/components/ReceiptPrint';
import { Search, Plus, Minus, Trash2, Printer, ShoppingCart, ImageIcon } from 'lucide-react';

interface POSProduct extends CartProduct {
  imageUrl?: string | null;
  sku?: string | null;
}

export default function POS() {
  const queryClient = useQueryClient();
  const { cart, discount, paymentMode, addToCart, removeFromCart, updateQty, setDiscount, setPaymentMode, clearCart } = useCartStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.sellPrice * item.cartQty, 0);
  const total = subtotal - discount;

  const { data: products = [] } = useQuery<POSProduct[]>({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data,
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkoutMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/transactions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      clearCart();
    },
  });

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    checkoutMutation.mutate({
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.cartQty,
        unitPrice: item.sellPrice,
      })),
      discount,
      paymentMode,
    });
  }, [cart, discount, paymentMode, checkoutMutation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.altKey) {
        e.preventDefault();
        handleCheckout();
      }
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCheckout, handlePrint]);

  return (
    <div className="flex flex-col md:flex-row h-full bg-background">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
        <div className="flex items-center gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search suits by name or SKU..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-y-auto flex-1 pb-6 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stockQty === 0}
              className="bg-card rounded-3xl border border-border hover:border-primary/50 hover:shadow-2xl transition-all active:scale-95 text-left flex flex-col group disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
            >
              {/* Product Image */}
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                   <span className="bg-black/60 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-tighter">
                    {product.sku || 'No SKU'}
                  </span>
                </div>
                {product.stockQty <= 5 && product.stockQty > 0 && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-orange-500 text-white text-[9px] px-2 py-1 rounded-lg font-black uppercase shadow-lg">
                      Low Stock
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-foreground text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-[10px] font-black uppercase ${product.stockQty <= 5 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                      Available: {product.stockQty}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xl font-black text-primary">₹{product.sellPrice.toLocaleString('en-IN')}</p>
                  <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-muted-foreground space-y-4 bg-muted/5 rounded-3xl border-2 border-dashed border-border">
              <ImageIcon className="w-16 h-16 opacity-10" />
              <p className="font-bold italic">No suits match your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full md:w-[400px] bg-card border-l border-border flex flex-col h-full shadow-2xl relative z-10">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
          <h2 className="text-xl font-black text-foreground flex items-center gap-3 tracking-tighter">
            <ShoppingCart className="w-6 h-6 text-primary" />
            CURRENT ORDER
            <span className="bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full font-black">{cart.length}</span>
          </h2>
          <button onClick={clearCart} className="text-[10px] font-black uppercase text-muted-foreground hover:text-destructive transition-colors tracking-widest">Reset</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full opacity-30 space-y-6">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em]">Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-transparent hover:border-border transition-all group">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border flex-shrink-0">
                   {item.imageUrl ? (
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <ImageIcon className="w-4 h-4 opacity-20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 px-3">
                  <h4 className="font-black text-foreground text-xs truncate uppercase tracking-tighter">{item.name}</h4>
                  <p className="text-sm text-primary font-black mt-0.5">₹{item.sellPrice.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-background rounded-xl border border-border overflow-hidden shadow-sm h-9">
                    <button onClick={() => updateQty(item.id, item.cartQty - 1)} className="px-2.5 hover:bg-muted text-muted-foreground transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-xs">{item.cartQty}</span>
                    <button onClick={() => addToCart(item)} className="px-2.5 hover:bg-muted text-muted-foreground transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        <div className="p-6 border-t border-border space-y-5 bg-muted/5">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              <span>Subtotal</span>
              <span className="text-foreground">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Discount</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-black">₹</span>
                <input
                  type="number"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-24 pl-6 pr-3 py-2 bg-background border border-input rounded-xl text-xs text-right font-black outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Payment</span>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-24 bg-background border border-input rounded-xl px-3 py-2 text-[10px] font-black outline-none focus:ring-4 focus:ring-primary/10 appearance-none text-center uppercase tracking-widest"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="CARD">CARD</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-border">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Final Amount</p>
              <p className="text-3xl font-black text-primary tracking-tighter">₹{total.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="p-4 bg-secondary text-secondary-foreground rounded-2xl hover:bg-secondary/80 transition-all shadow-lg active:scale-95"
              title="Alt + P"
            >
              <Printer className="w-6 h-6" />
            </button>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkoutMutation.isPending}
              className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-black text-base hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-primary/30 active:scale-[0.98] tracking-widest uppercase"
              title="Enter"
            >
              {checkoutMutation.isPending ? 'PROCESSING...' : 'COMPLETE ORDER'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Print Area */}
      <div className="hidden">
        <div ref={printRef}>
          <ReceiptPrint cart={cart} subtotal={subtotal} discount={discount} total={total} paymentMethod={paymentMode} />
        </div>
      </div>
    </div>
  );
}
