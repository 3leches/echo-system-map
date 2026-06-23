import { useStore } from "reactflow";
import { LAYERS } from "@/lib/atlas/types";
import { LANE_HEIGHT, LANE_TOP, useAtlas } from "@/lib/atlas/store";

// Renders horizontal swimlane bands in WORLD coordinates by reading
// the React Flow viewport transform. Place as a child of <ReactFlow>.
export function LaneBackground() {
  const [tx, ty, scale] = useStore((s) => s.transform);
  const visible = useAtlas((s) => s.visibleLayers);
  const highlight = useAtlas((s) => s.highlightLayer);

  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-0"
      style={{
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
        transformOrigin: "0 0",
        width: 4000,
        height: LANE_TOP + LAYERS.length * LANE_HEIGHT,
      }}
    >
      {LAYERS.map((layer, i) => {
        const y = LANE_TOP + i * LANE_HEIGHT;
        const isHidden = !visible[layer.id];
        const isDim = highlight && highlight !== layer.id;
        return (
          <div
            key={layer.id}
            className="absolute left-0 right-0 border-b border-dashed"
            style={{
              top: y,
              height: LANE_HEIGHT,
              borderColor: "color-mix(in oklab, var(--sand) 80%, transparent)",
              background: isHidden
                ? "repeating-linear-gradient(45deg, transparent 0 8px, color-mix(in oklab, var(--sand) 30%, transparent) 8px 9px)"
                : `linear-gradient(to right, color-mix(in oklab, ${layer.hue} 14%, transparent) 0%, color-mix(in oklab, ${layer.hue} 4%, transparent) 50%, transparent 100%)`,
              opacity: isDim ? 0.25 : 1,
              transition: "opacity 200ms",
            }}
          />
        );
      })}
    </div>
  );
}