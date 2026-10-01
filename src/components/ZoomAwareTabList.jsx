import React, { forwardRef, useEffect, useRef } from "react";
import { TabList } from "@mui/lab";

function assignRef(ref, node) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

function alignTabIndicator(root) {
  const scroller = root.querySelector(".MuiTabs-scroller");
  const selected = root.querySelector('[role="tab"].Mui-selected');
  const indicator = scroller?.querySelector(":scope > .MuiTabs-indicator");
  if (!scroller || !selected || !indicator) return;

  const zoom = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  const safeZoom = zoom > 0 ? zoom : 1;
  const scrollerRect = scroller.getBoundingClientRect();
  const tabRect = selected.getBoundingClientRect();
  const left = Math.round((tabRect.left - scrollerRect.left) / safeZoom + scroller.scrollLeft);
  const width = Math.round(tabRect.width / safeZoom);
  const nextLeft = `${left}px`;
  const nextWidth = `${width}px`;
  if (indicator.style.left === nextLeft && indicator.style.width === nextWidth) return;
  indicator.style.left = nextLeft;
  indicator.style.width = nextWidth;
}

const ZoomAwareTabList = forwardRef(function ZoomAwareTabList(props, forwardedRef) {
  const rootRef = useRef(null);

  const setRef = (node) => {
    rootRef.current = node;
    assignRef(forwardedRef, node);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let frame = 0;
    let indicatorNode = null;
    let indicatorObserver = null;

    const align = () => {
      const scroller = root.querySelector(".MuiTabs-scroller");
      const indicator = scroller?.querySelector(":scope > .MuiTabs-indicator");
      if (indicator && indicator !== indicatorNode) {
        indicatorObserver?.disconnect();
        indicatorNode = indicator;
        indicatorObserver = new MutationObserver(align);
        indicatorObserver.observe(indicator, { attributes: true, attributeFilter: ["style"] });
      }
      alignTabIndicator(root);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(align);
    };

    align();
    const timeout = window.setTimeout(align, 50);
    window.addEventListener("resize", schedule);

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(root);

    const structureObserver = new MutationObserver(schedule);
    structureObserver.observe(root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
      structureObserver.disconnect();
      indicatorObserver?.disconnect();
    };
  }, []);

  return <TabList ref={setRef} {...props} />;
});

export default ZoomAwareTabList;
