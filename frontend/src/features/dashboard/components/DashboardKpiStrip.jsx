import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Boxes, Tag, Users, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils.js';

export function DashboardKpiStrip({
  netRevenue = 0,
  ordersCount = 0,
  stockValuationCost = 0,
  totalActiveUnits = 0,
  customersCount = 0,
  isCashier = false
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Sales Revenue Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
              +100.0%
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-500">Net Revenue (Selected Period)</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono mt-1">
              {formatCurrency(netRevenue)}
            </div>
            <p className="text-[11.5px] text-slate-500 mt-1">
              <span className="font-bold text-slate-800">{ordersCount}</span> completed sales invoices
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100">
          <Link
            to="/reports"
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-between group transition-colors"
          >
            <span>View Sales Report</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 2. Total Items in Stock Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-500">Total Items in Stock</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono mt-1">
              {totalActiveUnits.toLocaleString()}
            </div>
            <p className="text-[11.5px] text-slate-500 mt-1">
              Dispensary units across active batches
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100">
          <Link
            to="/inventory"
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-between group transition-colors"
          >
            <span>View Stock</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 3. Stock Value at Cost Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-500">Stock Value (at cost)</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono mt-1">
              {isCashier ? 'Protected' : formatCurrency(stockValuationCost)}
            </div>
            <p className="text-[11.5px] text-slate-500 mt-1">
              Acquisition valuation based on FEFO lots
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100">
          <Link
            to="/inventory"
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-between group transition-colors"
          >
            <span>View Stock</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 4. Total Customers Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-mono">
              Active
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-500">Total Customers</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono mt-1">
              {customersCount.toLocaleString()}
            </div>
            <p className="text-[11.5px] text-slate-500 mt-1">
              Registered patient &amp; wholesale profiles
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100">
          <Link
            to="/customers"
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-between group transition-colors"
          >
            <span>View Customers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
