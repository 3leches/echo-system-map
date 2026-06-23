import { LAYERS, type LayerId } from "@/lib/atlas/types";
import { useAtlas } from "@/lib/atlas/store";

export function LayerRail() {
  const visible = useAtlas((s) => s.visibleLayers);
  const highlight = useAtlas((s) => s.highlightLayer);
  const toggleLayer = useAtlas((s) => s.toggleLayer);
  const setHighlight = useAtlas((s) => s.setHighlight);

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-border bg-paper">
      <div className="border-b border-border px-5 py-4">
        <div className="eyebrow">Organisation layers</div>
        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
          Click a layer to isolate it. Toggle the dot to hide its lane.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {LAYERS.map((layer) => {
          const isHidden = !visible[layer.id];
          const isActive = highlight === layer.id;
          return (
            <div
              key={layer.id}
              className={
                "group flex items-start gap-3 border-b border-border/60 px-5 py-3 transition-colors " +
                (isActive ? "bg-secondary" : "hover:bg-secondary/50")
              }
            >
              <button
                type="button"
                aria-label={isHidden ? "Show lane" : "Hide lane"}
                onClick={() => toggleLayer(layer.id as LayerId)}
                className="mt-1.5 h-3 w-3 shrink-0 rounded-full border"
                style={{
                  background: isHidden ? "transparent" : layer.hue,
                  borderColor: layer.hue,
                }}
              />
              <button
                type="button"
                onClick={() => setHighlight(isActive ? null : (layer.id as LayerId))}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-display text-[15px] text-foreground">{layer.label}</span>
                  {layer.id === "enterprise" && (
                    <span className="rounded-sm bg-accent/10 px-1.5 py-px text-[9px] font-medium uppercase tracking-wider text-accent">
                      Shared
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {layer.description}
                </div>
              </button>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={() => setHighlight(null)}
          className="eyebrow text-muted-foreground hover:text-foreground"
        >
          Clear isolation
        </button>
      </div>
    </aside>
  );
}