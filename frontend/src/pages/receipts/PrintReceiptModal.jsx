import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';

export default function PrintReceiptModal({ isOpen, onClose, receipt, subtotal, taxAmount, grandTotal }) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 print:my-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">Receipt Preview</span>
            <span className="text-xs text-slate-500 font-mono">[{receipt.internalNumber}]</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Document
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Content */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 bg-white">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-200 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  SS
                </div>
                <span className="font-bold tracking-tight text-lg text-slate-900">StockSense ERP</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Central Warehouse Logistics & Inventory Management</p>
              <p className="text-xs text-slate-500">Warehouse Location: <span className="font-medium text-slate-700">{receipt.warehouseLocation || 'WH/Stock/Main'}</span></p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold tracking-wider uppercase bg-slate-100 text-slate-800 border border-slate-200">
                Goods Receipt Note (GRN)
              </span>
              <h2 className="text-xl font-mono font-bold text-indigo-700 mt-1">{receipt.internalNumber}</h2>
              <p className="text-xs text-slate-500">Status: <span className="font-semibold uppercase text-slate-700">{receipt.status}</span></p>
            </div>
          </div>

          {/* Meta & Supplier Details 2-column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            {/* Supplier Box */}
            <div className="space-y-1">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Received From (Supplier):</span>
              <p className="text-sm font-bold text-slate-900">{receipt.supplier?.name || 'Unspecified Supplier'}</p>
              <p className="text-slate-600 leading-relaxed">
                {receipt.supplier?.address && `${receipt.supplier.address}, `}
                {receipt.supplier?.city && `${receipt.supplier.city}, `}
                {receipt.supplier?.state} {receipt.supplier?.pincode}
              </p>
              <div className="pt-1 text-slate-600 font-mono space-y-0.5">
                {receipt.supplier?.gstNumber && <p><span className="text-slate-500 font-sans">GSTIN:</span> {receipt.supplier.gstNumber}</p>}
                {receipt.supplier?.phone && <p><span className="text-slate-500 font-sans">Phone:</span> {receipt.supplier.phone}</p>}
                {receipt.supplier?.contactPerson && <p><span className="text-slate-500 font-sans">Contact:</span> {receipt.supplier.contactPerson}</p>}
              </div>
            </div>

            {/* Receipt Meta Box */}
            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Receipt Metadata:</span>
              <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                <span className="text-slate-500">Internal Ref:</span>
                <span className="font-mono font-semibold text-slate-800">{receipt.internalNumber}</span>

                <span className="text-slate-500">Seller Bill No:</span>
                <span className="font-mono font-semibold text-slate-800">{receipt.sellerBillNumber || 'N/A'}</span>

                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-medium text-slate-800">{receipt.scheduledDate || 'Not set'}</span>

                <span className="text-slate-500">Created On:</span>
                <span className="text-slate-800">{receipt.createdOn}</span>

                <span className="text-slate-500">Responsible Person:</span>
                <span className="font-medium text-slate-800">{receipt.responsible}</span>

                <span className="text-slate-500">Movement State:</span>
                <span className="font-medium text-indigo-700 capitalize">{receipt.movementStatus.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Goods / Products Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Received Goods & Materials</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3 font-mono">SKU / Code</th>
                    <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {receipt.items.map((item, idx) => (
                    <tr key={item.id} className="text-slate-700">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.productName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{item.sku}</td>
                      <td className="py-2.5 px-3 text-right">₹{item.cost.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.qty}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        ₹{item.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Financial Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 items-start">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600 block mb-1">Receipt Remarks & Inspection Notes:</span>
              <p className="text-slate-600 italic">{receipt.notes || 'Goods received in sound condition. Quantities physically counted and matched against vendor challan/invoice.'}</p>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Untaxed Amount (Subtotal):</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST / Tax ({receipt.taxRate}%):</span>
                <span className="font-semibold">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-indigo-700 font-mono">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Barcode & Signature Blocks */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div className="border border-dashed border-slate-300 rounded-lg p-3 flex flex-col justify-between h-24">
              <span className="text-slate-400">Delivered By (Transporter)</span>
              <span className="border-t border-slate-300 pt-1 text-slate-500">Sign & Date</span>
            </div>
            <div className="border border-dashed border-slate-300 rounded-lg p-3 flex flex-col justify-between h-24">
              <span className="text-slate-400">Quality Checked By</span>
              <span className="border-t border-slate-300 pt-1 text-slate-500">Sign & Date</span>
            </div>
            <div className="border border-dashed border-slate-300 rounded-lg p-3 flex flex-col justify-between h-24">
              <span className="text-slate-400">Warehouse Lead ({receipt.responsible})</span>
              <span className="border-t border-slate-300 pt-1 text-slate-500 font-medium text-slate-700">Authorized Signatory</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
