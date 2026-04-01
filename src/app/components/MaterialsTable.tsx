import { useState } from "react";
import type { MaterialRequested } from "../lib/types";
import { InlineEdit } from "./InlineEdit";

interface MaterialsTableProps {
  materials: MaterialRequested[];
  onChange?: (materials: MaterialRequested[]) => void;
  editable?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Brochure":    { bg: "bg-blue-100",   text: "text-blue-700"  },
  "Handout":     { bg: "bg-green-100",  text: "text-green-700" },
  "Poster":      { bg: "bg-violet-100", text: "text-violet-700"},
  "Fact Sheet":  { bg: "bg-amber-100",  text: "text-amber-700" },
  "Activity":    { bg: "bg-pink-100",   text: "text-pink-700"  },
  "Guide":       { bg: "bg-teal-100",   text: "text-teal-700"  },
  "Other":       { bg: "bg-surface-container-highest", text: "text-on-surface-muted" },
};

function getCategoryStyle(category: string | null) {
  if (!category) return CATEGORY_COLORS["Other"];
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS["Other"];
}

interface NewMaterialForm {
  material_name: string;
  quantity: string;
  category: string;
  has_digital: boolean;
}

export function MaterialsTable({ materials, onChange, editable = true }: MaterialsTableProps) {
  const [items, setItems] = useState<MaterialRequested[]>(materials);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState<NewMaterialForm>({
    material_name: "",
    quantity: "1",
    category: "Other",
    has_digital: false,
  });

  const update = (updated: MaterialRequested[]) => {
    setItems(updated);
    onChange?.(updated);
  };

  const handleQuantityChange = (id: string, val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) {
      update(items.map(m => m.id === id ? { ...m, quantity: n } : m));
    }
  };

  const handleRemove = (id: string) => {
    update(items.filter(m => m.id !== id));
  };

  const handleAdd = () => {
    if (!newForm.material_name.trim()) return;
    const qty = parseInt(newForm.quantity, 10);
    const newItem: MaterialRequested = {
      id: `mat-${Date.now()}`,
      submission_id: items[0]?.submission_id ?? "",
      material_key: newForm.material_name.toLowerCase().replace(/\s+/g, "_"),
      material_name: newForm.material_name.trim(),
      quantity: isNaN(qty) || qty < 1 ? 1 : qty,
      category: newForm.category || "Other",
      has_digital: newForm.has_digital,
    };
    update([...items, newItem]);
    setNewForm({ material_name: "", quantity: "1", category: "Other", has_digital: false });
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 && (
        <p className="text-sm text-on-surface-muted italic py-2">No materials requested.</p>
      )}

      {items.map(mat => {
        const catStyle = getCategoryStyle(mat.category);
        const isHovered = hoveredId === mat.id;

        return (
          <div
            key={mat.id}
            onMouseEnter={() => setHoveredId(mat.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3
              transition-colors duration-150 hover:bg-surface-container-high group"
          >
            {/* Material name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{mat.material_name}</p>
            </div>

            {/* Category pill */}
            <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${catStyle.bg} ${catStyle.text}`}>
              {mat.category ?? "Other"}
            </span>

            {/* Digital badge */}
            {mat.has_digital && (
              <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full
                bg-primary/10 text-primary">
                Digital
              </span>
            )}

            {/* Quantity */}
            <div className="shrink-0 flex items-center gap-1">
              <span className="text-xs text-on-surface-muted">Qty</span>
              {editable ? (
                <InlineEdit
                  value={String(mat.quantity)}
                  onSave={val => handleQuantityChange(mat.id, val)}
                  className="w-10 text-center font-semibold"
                />
              ) : (
                <span className="text-sm font-semibold text-on-surface w-8 text-center">
                  {mat.quantity}
                </span>
              )}
            </div>

            {/* Remove button */}
            {editable && (
              <button
                onClick={() => handleRemove(mat.id)}
                title="Remove material"
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer
                  text-on-surface-muted hover:text-status-denied hover:bg-red-50
                  transition-all duration-150 ${isHovered ? "opacity-100" : "opacity-0"}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}

      {/* Add material */}
      {editable && (
        <div className="mt-1">
          {showAddForm ? (
            <div className="bg-surface-container-low rounded-xl px-4 py-3 flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Material name"
                  value={newForm.material_name}
                  onChange={e => setNewForm(f => ({ ...f, material_name: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowAddForm(false); }}
                  className="flex-1 bg-surface-container-highest rounded-lg px-3 py-1.5 text-sm text-on-surface
                    focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={newForm.quantity}
                  min={1}
                  onChange={e => setNewForm(f => ({ ...f, quantity: e.target.value }))}
                  className="w-16 bg-surface-container-highest rounded-lg px-3 py-1.5 text-sm text-on-surface
                    focus:outline-none focus:ring-2 focus:ring-primary/30 text-center"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={newForm.category}
                  onChange={e => setNewForm(f => ({ ...f, category: e.target.value }))}
                  className="bg-surface-container-highest rounded-lg px-3 py-1.5 text-sm text-on-surface
                    focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {Object.keys(CATEGORY_COLORS).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-sm text-on-surface-muted cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newForm.has_digital}
                    onChange={e => setNewForm(f => ({ ...f, has_digital: e.target.checked }))}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  Has digital
                </label>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-sm text-on-surface-muted hover:text-on-surface cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="text-sm font-medium text-primary hover:text-primary-container cursor-pointer transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-sm text-on-surface-muted hover:text-primary
                cursor-pointer transition-colors duration-150 py-1 px-1 -mx-1 rounded-lg
                hover:bg-surface-container-low group"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add material</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
