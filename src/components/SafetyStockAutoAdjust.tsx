import React, { useMemo, useState } from 'react';
import { ShieldCheck, Play, Loader2, AlertTriangle } from 'lucide-react';
import useSafetyStockAuto from '../hooks/useSafetyStockAuto';

const SafetyStockAutoAdjust: React.FC = () => {
  const { warehouses, selectedWarehouse, setSelectedWarehouse, loading, error, result, runAutoAdjust } = useSafetyStockAuto();

  // Simple policy controls with sane defaults
  const [serviceLevel, setServiceLevel] = useState(0.95);
  const [leadTimeDays, setLeadTimeDays] = useState(7);
  const [maxChangePercent, setMaxChangePercent] = useState(20);
  const [roundToPack, setRoundToPack] = useState<number | ''>('');
  const [minSafetyStock, setMinSafetyStock] = useState(0);

  const handleRun = async () => {
    await runAutoAdjust({
      serviceLevel,
      leadTimeDays,
      maxChangePercent,
      roundToPack: typeof roundToPack === 'number' && roundToPack > 0 ? roundToPack : null,
      minSafetyStock
    });
  };

  const changes = useMemo(() => result?.changes || [], [result]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
          <div>
            <h2 className="text-xl font-bold">Safety Stock Automation</h2>
            <p className="text-sm text-slate-500">Auto-adjust berdasarkan pola permintaan dan guardrails</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="ai-label">Warehouse</label>
            <select
              className="ai-input"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              {warehouses.map(w => (
                <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="ai-label">Service Level</label>
            <select className="ai-input" value={serviceLevel} onChange={(e) => setServiceLevel(Number(e.target.value))}>
              <option value={0.9}>90% (z≈1.28)</option>
              <option value={0.95}>95% (z≈1.65)</option>
              <option value={0.975}>97.5% (z≈1.96)</option>
              <option value={0.99}>99% (z≈2.33)</option>
            </select>
          </div>

          <div>
            <label className="ai-label">Lead Time (days)</label>
            <input type="number" className="ai-input" min={1} value={leadTimeDays} onChange={e => setLeadTimeDays(Number(e.target.value))} />
          </div>

          <div>
            <label className="ai-label">Max Change (%)</label>
            <input type="number" className="ai-input" min={0} value={maxChangePercent} onChange={e => setMaxChangePercent(Number(e.target.value))} />
          </div>

          <div>
            <label className="ai-label">Round To Pack (optional)</label>
            <input type="number" className="ai-input" min={0} value={roundToPack} onChange={e => setRoundToPack(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>

          <div>
            <label className="ai-label">Min Safety Stock</label>
            <input type="number" className="ai-input" min={0} value={minSafetyStock} onChange={e => setMinSafetyStock(Number(e.target.value))} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button className="btn-primary inline-flex items-center" onClick={handleRun} disabled={loading || !selectedWarehouse}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run Auto-Adjust Now
          </button>
          {error && (
            <div className="flex items-center text-red-600 text-sm"><AlertTriangle className="w-4 h-4 mr-1" /> {error}</div>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Hasil Auto-Adjust</h3>
              <p className="text-sm text-slate-500">{new Date(result.generatedAt).toLocaleString('id-ID')}</p>
            </div>
            <div className="text-sm text-slate-600">Applied {result.appliedCount} of {result.totalCandidates} items</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Warehouse</th>
                  <th className="text-right p-3">Current</th>
                  <th className="text-right p-3">New</th>
                  <th className="text-right p-3">Delta %</th>
                  <th className="text-left p-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={`${c.productId}|${c.warehouseId}`} className="border-t">
                    <td className="p-3">{c.productName}</td>
                    <td className="p-3">{c.warehouseName}</td>
                    <td className="p-3 text-right">{c.currentSafetyStock}</td>
                    <td className="p-3 text-right">{c.recommendedSafetyStock}</td>
                    <td className={`p-3 text-right ${c.changePercent >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{c.changePercent.toFixed(1)}%</td>
                    <td className="p-3">{c.reason}</td>
                  </tr>
                ))}
                {changes.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan={6}>Tidak ada perubahan yang diperlukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyStockAutoAdjust;

