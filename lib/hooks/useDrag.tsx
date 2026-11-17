"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefCallback,
} from "react";

type DragPayload = { kind: string; id: string; label: string };
type DropHandler = (
  payload: DragPayload,
  zoneId: string,
  point: { x: number; y: number },
) => void;
type RegisteredZone = {
  id: string;
  accepts: string[];
  onDrop: DropHandler;
  element: HTMLElement;
};
type ActiveDrag = DragPayload & {
  x: number;
  y: number;
  over: string | null;
  dragging: boolean;
  pointerId: number;
  startX: number;
  startY: number;
};
type DragContextValue = {
  active: ActiveDrag | null;
  registerDropZone: (
    id: string,
    accepts: string[],
    onDrop: DropHandler,
  ) => RefCallback<HTMLElement>;
  startDrag: (event: ReactPointerEvent<HTMLElement>, payload: DragPayload) => void;
  isOver: (id: string) => boolean;
};
const DragContext = createContext<DragContextValue | null>(null);

export function DragProvider({ children }: { children: ReactNode }) {
  const zones = useRef(new Map<string, RegisteredZone>());
  const [active, setActive] = useState<ActiveDrag | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  const registerDropZone = useCallback(
    (id: string, accepts: string[], onDrop: DropHandler): RefCallback<HTMLElement> =>
      (element) => {
        if (element) zones.current.set(id, { id, accepts, onDrop, element });
        else zones.current.delete(id);
      },
    [],
  );
  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>, payload: DragPayload) => {
      setActive({
        ...payload,
        x: event.clientX,
        y: event.clientY,
        over: null,
        dragging: false,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      });
    },
    [],
  );

  useEffect(() => {
    const findZone = (kind: string, x: number, y: number) =>
      [...zones.current.values()]
        .filter((zone) => zone.accepts.includes(kind))
        .find((zone) => {
          const rect = zone.element.getBoundingClientRect();
          return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        });
    const onMove = (event: PointerEvent) => {
      const current = activeRef.current;
      if (!current || event.pointerId !== current.pointerId) return;
      const distance = Math.hypot(event.clientX - current.startX, event.clientY - current.startY);
      const dragging = current.dragging || distance > 7;
      if (!dragging) {
        setActive({ ...current, x: event.clientX, y: event.clientY });
        return;
      }
      event.preventDefault();
      const target = findZone(current.kind, event.clientX, event.clientY);
      setActive({ ...current, x: event.clientX, y: event.clientY, dragging: true, over: target?.id ?? null });
    };
    const onUp = (event: PointerEvent) => {
      const current = activeRef.current;
      if (!current || event.pointerId !== current.pointerId) return;
      if (current.dragging) {
        const target = findZone(current.kind, event.clientX, event.clientY);
        if (target) target.onDrop(current, target.id, { x: event.clientX, y: event.clientY });
      }
      setActive(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const isOver = useCallback(
    (id: string) => Boolean(active?.dragging && active.over === id),
    [active],
  );
  const value = useMemo(
    () => ({ active, registerDropZone, startDrag, isOver }),
    [active, registerDropZone, startDrag, isOver],
  );
  return (
    <DragContext.Provider value={value}>
      {children}
      {active?.dragging && (
        <div className="drag-ghost" style={{ left: active.x, top: active.y }} aria-hidden="true">
          {active.label}
        </div>
      )}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const context = useContext(DragContext);
  if (!context) throw new Error("useDrag must be used inside DragProvider");
  return context;
}
