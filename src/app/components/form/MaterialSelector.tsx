import { useState } from "react";
import { ChevronDown, ChevronUp, Globe, Minus, Plus } from "lucide-react";
import { MATERIAL_CATALOG, type MaterialSelection } from "../../lib/formTypes";

interface MaterialSelectorProps {
  value: MaterialSelection;
  onChange: (value: MaterialSelection) => void;
}

export function MaterialSelector({ value, onChange }: MaterialSelectorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    vehicle_driveway: true,
  });

  function toggleCategory(catId: string) {
    setExpanded((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }

  function toggleItem(key: string) {
    const current = value[key];
    if (current?.selected) {
      const next = { ...value };
      delete next[key];
      onChange(next);
    } else {
      onChange({ ...value, [key]: { selected: true, quantity: 25 } });
    }
  }

  function setQuantity(key: string, qty: number) {
    if (qty < 1) return;
    onChange({
      ...value,
      [key]: { ...value[key], selected: true, quantity: qty },
    });
  }

  function setCustomText(key: string, text: string) {
    onChange({
      ...value,
      [key]: { ...value[key], selected: true, quantity: value[key]?.quantity || 1, customText: text },
    });
  }

  const selectedCount = Object.values(value).filter((v) => v.selected).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-on-surface-muted">
          {selectedCount} material{selectedCount !== 1 ? "s" : ""} selected
        </p>
      </div>

      {MATERIAL_CATALOG.map((category) => {
        const isOpen = expanded[category.id] ?? false;
        const catSelectedCount = category.items.filter((item) => value[item.key]?.selected).length;

        return (
          <div key={category.id} className="rounded-xl bg-surface-container-low overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-surface-container-high transition-colors"
              aria-expanded={isOpen}
              aria-controls={`cat-${category.id}`}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-on-surface font-display">
                  {category.label}
                </span>
                {catSelectedCount > 0 && (
                  <span className="text-xs font-medium text-white bg-primary rounded-full px-2 py-0.5">
                    {catSelectedCount}
                  </span>
                )}
              </span>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-on-surface-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-on-surface-muted" />
              )}
            </button>

            {isOpen && (
              <div id={`cat-${category.id}`} className="px-4 pb-3 flex flex-col gap-2">
                {category.items.map((item) => {
                  const sel = value[item.key];
                  const isSelected = sel?.selected ?? false;

                  return (
                    <div key={item.key} className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-3 flex-1 cursor-pointer min-h-[44px]">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItem(item.key)}
                            className="w-5 h-5 rounded accent-primary cursor-pointer"
                          />
                          <span className="text-sm text-on-surface">{item.name}</span>
                          {item.hasSpanish && (
                            <span className="flex items-center gap-1 text-xs text-primary bg-surface-container-highest rounded-full px-2 py-0.5">
                              <Globe className="w-3 h-3" />
                              ES
                            </span>
                          )}
                        </label>

                        {isSelected && item.key !== "other" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setQuantity(item.key, (sel?.quantity ?? 25) - 5)}
                              className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer"
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={sel?.quantity ?? 25}
                              onChange={(e) => setQuantity(item.key, parseInt(e.target.value) || 1)}
                              className="w-14 text-center text-sm font-medium bg-transparent text-on-surface rounded-lg px-1 py-1"
                              aria-label={`${item.name} quantity`}
                            />
                            <button
                              type="button"
                              onClick={() => setQuantity(item.key, (sel?.quantity ?? 25) + 5)}
                              className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer"
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isSelected && item.key === "other" && (
                        <div className="ml-8">
                          <label htmlFor="other-material-text" className="sr-only">Describe your custom request</label>
                          <textarea
                            id="other-material-text"
                            value={sel?.customText ?? ""}
                            onChange={(e) => setCustomText("other", e.target.value)}
                            placeholder="Describe what you need and quantity..."
                            className="w-full px-3 py-2 rounded-xl bg-surface-container text-sm text-on-surface placeholder:text-on-surface-muted/50 resize-y min-h-[60px]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
