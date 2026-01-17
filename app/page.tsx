"use client";
import React, { useState,useEffect } from 'react';
// Assuming products.json is one level up from app/page.tsx
import initialData from '../data/default.json'
import * as XLSX from 'xlsx';

// Define the structure of your product data
interface Product {
  id: number;
  name: string;
  buyPrice: number;
  salePrice: number;
  initialStock: number;
  remainingStock: number;
  // NOTE: Do NOT include calculated fields (like revenue or profit) here.
}

export default function SalesApp() {
  const [products, setProducts] = useState<Product[]>(initialData as Product[]);
  const [editMode, setEditMode] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  // --- Date Initialization ---
  useEffect(() => {
    const today = new Date();
    // Format: DD/MM/YYYY
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    setCurrentDate(formattedDate);
  }, []);

  // --- Calculations ---
  // Calculate Global Totals (Sold, Revenue, Profit)
  const totalStats = products.reduce((acc, p) => {
    const sold = p.initialStock - p.remainingStock;
    acc.sold += sold;
    acc.revenue += sold * p.salePrice;
    acc.profit += sold * (p.salePrice - p.buyPrice);
    return acc;
  }, { sold: 0, revenue: 0, profit: 0 });

  // --- State Handlers ---
  const updateStock = (id: number, value: string) => {
    // Treat empty string as 0 for robust input handling
    const numValue = value === "" ? 0 : parseInt(value);
    setProducts(products.map(p => 
      p.id === id ? { ...p, remainingStock: numValue } : p
    ));
  };

  const updateDefault = (id: number, field: keyof Product, value: string | number) => {
    let finalValue: string | number = value;

    // Convert prices and stocks to numbers if the field isn't 'name'
    if (field !== 'name' && typeof value === 'string') {
        // Use parseFloat for prices and parseInt for stock counts
        finalValue = field.includes('Price') ? parseFloat(value) : parseInt(value);
    }

    setProducts(products.map(p => 
      p.id === id ? { ...p, [field]: finalValue } : p
    ));
  };

  // --- Excel Export Function ---
  const downloadExcel = () => {
    const dataForExcel = products.map(p => {
      const sold = p.initialStock - p.remainingStock;
      return {
        "Date": currentDate,
        "Product Name": p.name,
        "Buy Price": p.buyPrice,
        "Sale Price": p.salePrice,
        "Initial Stock": p.initialStock,
        "Remaining Stock": p.remainingStock,
        "Items Sold": sold,
        "Total Revenue": sold * p.salePrice,
        "Total Profit": sold * (p.salePrice - p.buyPrice)
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Sales_${currentDate.replace(/\//g, '-')}`);
    XLSX.writeFile(workbook, `Sales_Report_${currentDate.replace(/\//g, '-')}.xlsx`);
  };

  // --- Rendered Component ---
  return (
    <div className="min-h-screen bg-gray-400 pt-4 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto">
        
      <div className="text-center mb-6 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-extrabold text-gray-800 tracking-wider">
                DATE: {currentDate}
            </h2>
        </div>

       
       

        {/* Inventory Table */}
      {/* Inventory Table (Mobile Optimized) */}
      <div className="bg-white shadow-md border border-gray-200 overflow-hidden">
          {/* Added overflow-x-auto here for horizontal scrolling on small screens */}
          <div className="overflow-x-auto"> 
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="p-2 font-bold text-gray-600 min-w-[120px]">Product</th>
                  <th className="p-2 font-bold text-gray-600 min-w-[80px]">Buy $</th>
                  <th className="p-2 font-bold text-gray-600 min-w-[80px]">Sell $</th>
                  <th className="p-2 font-bold text-red-600 min-w-[90px]">Init. Stock</th>
                  <th className="p-2 font-bold text-blue-700 bg-blue-100 min-w-[120px]">Remaining (Input)</th>
                  <th className="p-2 font-bold text-yellow-600 min-w-[100px]">Sold</th>
                  <th className="p-2 font-bold text-gray-600 min-w-[100px]">Revenue</th>
                  <th className="p-2 font-bold text-gray-600 min-w-[100px]">Profit</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const sold = p.initialStock - p.remainingStock;
                  const revenue = sold * p.salePrice; // Calculate revenue
                  const profit = sold * (p.salePrice - p.buyPrice);
                  
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                      <td className="p-2 min-w-[120px]">
                        {editMode ? <input className="border rounded p-1 w-full" value={p.name} onChange={(e) => updateDefault(p.id, 'name', e.target.value)} /> : p.name}
                      </td>
                      <td className="p-2 min-w-[80px]">
                        {editMode ? <input type="number" className="border rounded p-1 w-20" value={p.buyPrice} onChange={(e) => updateDefault(p.id, 'buyPrice', e.target.value)} /> : `$${p.buyPrice}`}
                      </td>
                      <td className="p-2 min-w-[80px]">
                        {editMode ? <input type="number" className="border rounded p-1 w-20" value={p.salePrice} onChange={(e) => updateDefault(p.id, 'salePrice', e.target.value)} /> : `$${p.salePrice}`}
                      </td>
                      <td className="p-2 text-red-600 min-w-[90px]">
                        {editMode ? <input type="number" className="border rounded p-1 w-20" value={p.initialStock} onChange={(e) => updateDefault(p.id, 'initialStock', e.target.value)} /> : p.initialStock}
                      </td>
                      <td className="p-2 bg-blue-50 min-w-[120px]">
                        <input 
                          type="number" 
                          className="border-2 border-blue-400 rounded p-1 w-24 text-center font-bold focus:border-blue-600 outline-none transition"
                          value={p.remainingStock} 
                          onChange={(e) => updateStock(p.id, e.target.value)}
                        />
                      </td>
                      <td className="p-4 font-bold text-yellow-600 min-w-[100px]"> {sold}</td>
                      <td className="p-4 font-bold text-blue-600 min-w-[100px]">${revenue}</td> 
                      <td className="p-4 font-bold text-green-600 min-w-[100px]">${profit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
         {/* Total Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
         
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Revenue</p>
            <p className="text-3xl font-black text-blue-600">${totalStats.revenue}</p>
          </div>
          <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm">
            <p className="text-sm text-green-700 uppercase font-bold tracking-wider">Net Profit</p>
            <p className="text-3xl font-black text-green-700">${totalStats.profit}</p>
          </div>
        </div>

        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-400 p-6 rounded-xl shadow-md border border-black-200">
          <div>
            <h1 className="text-2xl font-bold">Cigarette Sales Dashboard</h1>
            <p className="text-gray-500 text-sm">Update remaining stock for instant profit calculation</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button 
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${editMode ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {editMode ? "Save Changes" : "Edit Prices/Stock"}
            </button>
            <button 
              onClick={downloadExcel} 
              className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}