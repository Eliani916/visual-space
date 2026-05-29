"use client";

import { useEffect, useState } from "react";
import { getPromos, createPromo, updatePromo, deletePromo } from "../actions/promo.actions";
import { getPackages } from "@/features/package/actions/package.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, RefreshCw, Info, CheckCircle2, AlertCircle } from "lucide-react";

export default function PromoList() {
  const [promos, setPromos] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [isActive, setIsActive] = useState(true);
  const [maxUses, setMaxUses] = useState<number | "">("");
  const [applicablePackageIds, setApplicablePackageIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    const res = await getPromos();
    if (res.success) {
      setPromos(res.data || []);
    } else {
      toast.error(res.message || "Gagal memuat daftar promo");
    }
    setLoading(false);
  };

  const fetchPackages = async () => {
    const res = await getPackages(true); // Include inactive but not deleted
    if (res.success) {
      setPackages(res.data || []);
    }
  };

  useEffect(() => {
    fetchPromos();
    fetchPackages();
  }, []);

  const handleDelete = async (id: string, promoCode: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kode promo "${promoCode}"?`)) return;
    
    const res = await deletePromo(id);
    if (res.success) {
      toast.success(res.message || "Promo berhasil dihapus");
      fetchPromos();
    } else {
      toast.error(res.message || "Gagal menghapus promo");
    }
  };

  const handleToggleActive = async (promo: any) => {
    const res = await updatePromo(promo.id, {
      code: promo.code,
      discountPercent: promo.discountPercent,
      isActive: !promo.isActive,
    });

    if (res.success) {
      toast.success(`Status promo "${promo.code}" berhasil diperbarui`);
      fetchPromos();
    } else {
      toast.error(res.message || "Gagal memperbarui status promo");
    }
  };

  const handleEdit = (promo: any) => {
    setEditingId(promo.id);
    setCode(promo.code);
    setDiscountPercent(promo.discountPercent);
    setIsActive(promo.isActive);
    setMaxUses(promo.maxUses !== null && promo.maxUses !== undefined ? promo.maxUses : "");
    setApplicablePackageIds(
      promo.applicablePackageIds
        ? promo.applicablePackageIds.split(",").map((id: string) => id.trim()).filter(Boolean)
        : []
    );
    setOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setCode("");
    setDiscountPercent(10);
    setIsActive(true);
    setMaxUses("");
    setApplicablePackageIds([]);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Kode promo wajib diisi");
      return;
    }

    if (discountPercent < 1 || discountPercent > 100) {
      toast.error("Diskon harus bernilai antara 1-100%");
      return;
    }

    setSaving(true);
    let res;

    const applicablePackagesString = applicablePackageIds.length > 0
      ? applicablePackageIds.join(",")
      : null;
    const maxUsesValue = maxUses === "" ? null : Number(maxUses);

    if (editingId) {
      res = await updatePromo(editingId, {
        code,
        discountPercent,
        isActive,
        maxUses: maxUsesValue,
        applicablePackageIds: applicablePackagesString,
      });
    } else {
      res = await createPromo({
        code,
        discountPercent,
        isActive,
        maxUses: maxUsesValue,
        applicablePackageIds: applicablePackagesString,
      });
    }

    if (res.success) {
      toast.success(editingId ? "Promo berhasil diperbarui" : "Promo baru berhasil dibuat");
      setOpen(false);
      fetchPromos();
    } else {
      toast.error(res.message || "Gagal menyimpan promo");
    }
    setSaving(false);
  };

  const getApplicablePackagesLabel = (applicableIdsStr: string | null) => {
    if (!applicableIdsStr) return "Semua Paket";
    const ids = applicableIdsStr.split(",").map(id => id.trim()).filter(Boolean);
    if (ids.length === 0) return "Semua Paket";
    
    const names = ids.map(id => {
      const pkg = packages.find(p => p.id === id);
      return pkg ? pkg.name : "Paket Tidak Dikenal";
    });
    return names.join(", ");
  };

  return (
    <div className="space-y-4">
      {/* List Action Header */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Kelola Promo</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Total: {promos.length} kode promo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPromos} className="h-9 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
              <Button onClick={handleAdd} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9 cursor-pointer">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Promo
              </Button>
            } />
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Promo" : "Tambah Promo Baru"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {/* Promo Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Kode Promo</label>
                  <Input 
                    placeholder="Contoh: DISKON10" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)}
                    className="uppercase"
                    disabled={saving}
                  />
                </div>

                {/* Discount Percentage */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Diskon (%)</label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={discountPercent} 
                    onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
                    disabled={saving}
                  />
                </div>

                {/* Quota limit (Everyone / First 100, etc.) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Target Pengguna & Kuota</label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-350 cursor-pointer">
                      <input
                        type="radio"
                        name="quotaType"
                        checked={maxUses === ""}
                        onChange={() => setMaxUses("")}
                        className="h-4 w-4 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        disabled={saving}
                      />
                      <span>Semua Orang (Tanpa Batas)</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-350 cursor-pointer">
                      <input
                        type="radio"
                        name="quotaType"
                        checked={maxUses !== ""}
                        onChange={() => {
                          if (maxUses === "") setMaxUses(100);
                        }}
                        className="h-4 w-4 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        disabled={saving}
                      />
                      <span>Terbatas (Contoh: 100 Tercepat)</span>
                    </label>
                  </div>
                  {maxUses !== "" && (
                    <div className="pt-1">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Jumlah kuota penggunaan (misal: 100)"
                        value={maxUses}
                        onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                        className="w-full"
                        disabled={saving}
                      />
                      <p className="text-xxs text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3 text-indigo-500" />
                        Hanya booking dengan status aktif yang akan mengurangi kuota penggunaan.
                      </p>
                    </div>
                  )}
                </div>

                {/* Packages applicability */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Penerapan Paket</label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-350 cursor-pointer">
                      <input
                        type="radio"
                        name="packageType"
                        checked={applicablePackageIds.length === 0}
                        onChange={() => setApplicablePackageIds([])}
                        className="h-4 w-4 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        disabled={saving}
                      />
                      <span>Semua Paket</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-350 cursor-pointer">
                      <input
                        type="radio"
                        name="packageType"
                        checked={applicablePackageIds.length > 0}
                        onChange={() => {
                          if (applicablePackageIds.length === 0 && packages.length > 0) {
                            setApplicablePackageIds([packages[0].id]);
                          }
                        }}
                        className="h-4 w-4 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        disabled={saving}
                      />
                      <span>Paket Tertentu (Salah satu atau Beberapa)</span>
                    </label>
                  </div>
                  {applicablePackageIds.length > 0 && (
                    <div className="border border-slate-200 dark:border-zinc-800 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-slate-50 dark:bg-zinc-950/40">
                      {packages.map((pkg) => {
                        const isChecked = applicablePackageIds.includes(pkg.id);
                        return (
                          <label key={pkg.id} className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setApplicablePackageIds([...applicablePackageIds, pkg.id]);
                                } else {
                                  setApplicablePackageIds(applicablePackageIds.filter((id) => id !== pkg.id));
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              disabled={saving}
                            />
                            <span>{pkg.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Promo Status Toggle */}
                <div className="flex items-center space-x-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    disabled={saving}
                  />
                  <label htmlFor="isActiveCheckbox" className="text-sm font-semibold text-slate-700 dark:text-zinc-350 cursor-pointer">
                    Aktifkan Kode Promo
                  </label>
                </div>

                <Button type="submit" disabled={saving} className="w-full mt-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                  {saving ? "Menyimpan..." : editingId ? "Perbarui Promo" : "Tambah Promo"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-200/85 dark:border-zinc-800/85 rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/75 dark:bg-zinc-950/20">
            <TableRow>
              <TableHead className="font-semibold text-slate-700 dark:text-zinc-300">Kode Promo</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-zinc-300">Diskon</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-zinc-300">Berlaku Paket</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-zinc-300">Kuota Terpakai</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-zinc-300">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-zinc-300 text-right pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                    <span className="text-sm">Memuat data promo...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : promos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-zinc-500">
                  Belum ada kode promo terdaftar. Klik "Tambah Promo" untuk membuat baru.
                </TableCell>
              </TableRow>
            ) : (
              promos.map((promo) => (
                <TableRow key={promo.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                  <TableCell className="font-bold text-indigo-600 dark:text-indigo-400 py-4.5 tracking-wider uppercase">
                    {promo.code}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800 dark:text-zinc-200">
                    {promo.discountPercent}%
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-slate-600 dark:text-zinc-400 font-medium" title={getApplicablePackagesLabel(promo.applicablePackageIds)}>
                    {getApplicablePackagesLabel(promo.applicablePackageIds)}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 dark:text-zinc-300">
                    {promo.maxUses !== null && promo.maxUses !== undefined ? (
                      <div className="flex flex-col gap-1 w-28">
                        <div className="flex justify-between text-xs">
                          <span>{promo.usedCount} / {promo.maxUses}</span>
                          {promo.usedCount >= promo.maxUses && (
                            <span className="text-rose-500 font-bold text-xxs tracking-wider uppercase">Habis</span>
                          )}
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${promo.usedCount >= promo.maxUses ? 'bg-rose-500' : 'bg-indigo-600'}`}
                            style={{ width: `${Math.min(100, (promo.usedCount / promo.maxUses) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1 text-xs">
                        {promo.usedCount} / <span className="font-bold">∞</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(promo)}
                      className={`px-3 py-1 rounded-full text-xxs font-bold tracking-wider uppercase border transition-colors cursor-pointer ${
                        promo.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30"
                      }`}
                    >
                      {promo.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-1.5 pr-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(promo)}
                      className="h-8 w-8 p-0 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      title="Edit Promo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(promo.id, promo.code)}
                      className="h-8 w-8 p-0 border-red-200 dark:border-red-950/40 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 dark:hover:bg-red-650 dark:hover:border-red-650 cursor-pointer"
                      title="Hapus Promo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
