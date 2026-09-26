import React from 'react';
import { X, Printer, Truck, CheckCircle2 } from 'lucide-react';

export default function PrintDeliveryModal({ isOpen, onClose, delivery, subtotal, taxAmount, grandTotal }) {
  if (!isOpen || !delivery) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 print:my-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">Delivery Slip Preview</span>
            <span className="text-xs text-slate-500 font-mono">[{delivery.internalNumber}]</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Delivery Challan
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
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
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  SS
                </div>
                <span className="font-bold tracking-tight text-lg text-slate-900">StockSense ERP</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Outbound Logistics & Dispatch Operations</p>
              <p className="text-xs text-slate-500">Dispatch Hub: <span className="font-medium text-slate-700">{delivery.warehouseLocation || 'WH/Stock/Dispatch'}</span></p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                Delivery Order / Dispatch Slip
              </span>
              <h2 className="text-xl font-mono font-bold text-emerald-700 mt-1">{delivery.internalNumber}</h2>
              <p className="text-xs text-slate-500">Status: <span className="font-semibold uppercase text-slate-700">{delivery.status}</span></p>
            </div>
          </div>

          {/* Customer & Delivery Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            {/* Customer Box */}
            <div className="space-y-1">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Deliver To (Customer):</span>
              <p className="text-sm font-bold text-slate-900">{delivery.customer?.name || 'Unspecified Customer'}</p>
              <p className="text-slate-600 leading-relaxed">
                {delivery.customer?.shippingAddress && `${delivery.customer.shippingAddress}, `}
                {delivery.customer?.city && `${delivery.customer.city}, `}
                {delivery.customer?.state} {delivery.customer?.pincode}
              </p>
              <div className="pt-1 text-slate-600 font-mono space-y-0.5">
                {delivery.customer?.gstNumber && <p><span className="text-slate-500 font-sans">GSTIN:</span> {delivery.customer.gstNumber}</p>}
                {delivery.customer?.phone && <p><span className="text-slate-500 font-sans">Phone:</span> {delivery.customer.phone}</p>}
                {delivery.customer?.contactPerson && <p><span className="text-slate-500 font-sans">Contact:</span> {delivery.customer.contactPerson}</p>}
              </div>
            </div>

            {/* Logistics & Tracking Meta */}
            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Logistics & Order Info:</span>
              <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                <span className="text-slate-500">Source Order:</span>
                <span className="font-mono font-semibold text-slate-800">{delivery.sourceDocument || 'Direct Dispatch'}</span>

                <span className="text-slate-500">Customer Ref / PO:</span>
                <span className="font-mono text-slate-800">{delivery.customerReference || 'N/A'}</span>

                <span className="text-slate-500">Carrier / Transporter:</span>
                <span className="font-medium text-slate-800">{delivery.carrier || 'Internal Fleet'}</span>

                <span className="text-slate-500">Tracking / AWB No:</span>
                <span className="font-mono text-slate-800">{delivery.trackingNumber || 'N/A'}</span>

                <span className="text-slate-500">Vehicle Number:</span>
                <span className="font-mono font-semibold text-slate-800">{delivery.vehicleNumber || 'N/A'}</span>

                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-medium text-slate-800">{delivery.scheduledDate || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Delivered Goods & Items Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Dispatched Items & Quantities</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3 font-mono">SKU / Code</th>
                    <th className="py-2.5 px-3 text-right">Price (₹)</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {delivery.items.map((item, idx) => (
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

          {/* Remarks & Financial Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 items-start">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600 block mb-1">Dispatch Remarks / Instructions:</span>
              <p className="text-slate-600 italic">{delivery.notes || 'Items packed and checked against quality checklist. Please sign acknowledgement upon delivery.'}</p>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Untaxed Amount (Subtotal):</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST / Tax ({delivery.taxRate}%):</span>
                <span className="font-semibold">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-emerald-700 font-mono">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Barcode & Signature Blocks */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div className="border border-dashed border-slate-300 rounded-lg p-3 flex flex-col justify-between h-24">
              <span className="text-slate-400">Warehouse Dispatcher ({delivery.responsible})</span>
              <span className="border-t border-slate-300 pt-1 text-slate-500 font-medium text-slate-700">Authorized Signatory</span>
            </div>
            <div className="border border-dashed border-slate-300 rounded-lg p-3 flex flex-col justify-between h-24">
              <span className="text-slate-400">Transporter / Driver ({delivery.carrier})</span>
              <span className="border-t border-slate-300 pt-1 text-slate-500">Sign & Date</span>
            </div>
            <div className="border border-dashed border-slate-300 rounded-lg p-3 flex flex-col justify-between h-24">
              <span className="text-slate-400">Received By Customer ({delivery.customer?.name || 'Customer'})</span>
              <span className="border-t border-slate-300 pt-1 text-slate-500">Stamp, Sign & Date</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
