import { useEffect, useRef, useState } from "react";

const MM_TO_PX = 96 / 25.4;

const A4_WIDTH_PX = 210 * MM_TO_PX;
const A4_HEIGHT_PX = 297 * MM_TO_PX;

export default function ResponsiveInvoicePreview({ children }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const updateScale = () => {
      const availableWidth = Math.max(container.clientWidth - 2, 0);

      const nextScale = Math.min(1, availableWidth / A4_WIDTH_PX);

      setScale(nextScale);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);

    resizeObserver.observe(container);

    window.addEventListener("resize", updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-hidden bg-white">
      <div
        className="relative mx-auto"
        style={{
          width: `${A4_WIDTH_PX * scale}px`,
          height: `${A4_HEIGHT_PX * scale}px`,
        }}
      >
        <div
          style={{
            width: `${A4_WIDTH_PX}px`,
            height: `${A4_HEIGHT_PX}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
