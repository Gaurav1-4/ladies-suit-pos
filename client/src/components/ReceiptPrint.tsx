import type { CartItem } from '@/store/useCartStore';

interface ReceiptPrintProps {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
}

export default function ReceiptPrint({ cart, subtotal, discount, total, paymentMethod }: ReceiptPrintProps) {
  const now = new Date();

  return (
    <div className="p-6 max-w-[300px] mx-auto bg-white text-black font-mono text-xs">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">LADIES SUIT SHOP</h1>
        <p className="text-[10px] text-gray-500">Tax Invoice / Receipt</p>
        <p className="text-[10px] text-gray-500 mt-1">
          {now.toLocaleDateString('en-IN')} &middot; {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Items Header */}
      <div className="flex justify-between font-bold mb-1 px-1">
        <span>Item Description</span>
        <span>Total</span>
      </div>
      <div className="border-t border-dashed border-gray-300 mb-2" />

      {/* Items */}
      <div className="space-y-2">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-col">
            <div className="flex justify-between">
              <span className="flex-1 pr-2">{item.name}</span>
              <span className="font-bold">₹{(item.sellPrice * item.cartQty).toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-gray-500">
              {item.cartQty} x ₹{item.sellPrice.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-dashed border-gray-400 mt-4 pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-gray-600 italic">
            <span>Discount</span>
            <span>-₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="border-t border-dashed border-gray-400 pt-1 flex justify-between font-bold text-sm">
          <span>TOTAL PAYABLE</span>
          <span>₹{total.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-2">
          <span>Payment Mode</span>
          <span>{paymentMethod}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-[10px] text-gray-400 border-t border-dotted border-gray-200 pt-4">
        <p className="font-bold">Thank you for your visit!</p>
        <p className="mt-1 italic">Please visit us again at</p>
        <p className="font-bold text-gray-600">Gaurav Ladies Suit Collection</p>
        <p className="mt-2 text-[8px]">Terms: Exchange within 7 days with bill only.</p>
      </div>
    </div>
  );
}
