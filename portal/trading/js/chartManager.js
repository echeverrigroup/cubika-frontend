
export function createChartManager(container, onChartClick) {
  if (!window.LightweightCharts) {
    throw new Error("No se pudo cargar Lightweight Charts desde CDN.");
  }

  const {
    createChart,
    CandlestickSeries,
    LineSeries,
    ColorType
  } = window.LightweightCharts;

  const chart = createChart(container, {
    layout: {
      background: { type: ColorType.Solid, color: "#111820" },
      textColor: "#91a0af",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      fontSize: 11
    },
    grid: {
      vertLines: { color: "rgba(115, 135, 155, 0.08)" },
      horzLines: { color: "rgba(115, 135, 155, 0.08)" }
    },
    rightPriceScale: {
      borderColor: "#293642",
      scaleMargins: { top: 0.12, bottom: 0.12 }
    },
    timeScale: {
      borderColor: "#293642",
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 8
    },
    crosshair: { mode: 0 },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: false
    },
    handleScale: {
      mouseWheel: true,
      pinch: true,
      axisPressedMouseMove: true
    }
  });

  const candleSeries = chart.addSeries(CandlestickSeries, {
    upColor: "#24b887",
    downColor: "#e45f70",
    borderUpColor: "#24b887",
    borderDownColor: "#e45f70",
    wickUpColor: "#24b887",
    wickDownColor: "#e45f70",
    priceLineVisible: false
  });

  const trendlineSeries = chart.addSeries(LineSeries, {
    color: "#e6bd67",
    lineWidth: 2,
    lineStyle: 0,
    lastValueVisible: false,
    priceLineVisible: false,
    crosshairMarkerVisible: false,
    autoscaleInfoProvider: () => null
  });

  // Capa visual independiente para la regla.
  container.style.position = "relative";

  const rulerSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  rulerSvg.setAttribute("width", "100%");
  rulerSvg.setAttribute("height", "100%");
  rulerSvg.style.position = "absolute";
  rulerSvg.style.inset = "0";
  rulerSvg.style.width = "100%";
  rulerSvg.style.height = "100%";
  rulerSvg.style.overflow = "visible";
  rulerSvg.style.pointerEvents = "none";
  rulerSvg.style.zIndex = "10";

  container.appendChild(rulerSvg);

  let rulerPoints = null;
  let clickHandler = onChartClick;

  function renderRuler() {
    rulerSvg.replaceChildren();

    if (!rulerPoints) return;

    const timeScale = chart.timeScale();

    const x1 = timeScale.timeToCoordinate(rulerPoints.start.time);
    const y1 = candleSeries.priceToCoordinate(rulerPoints.start.price);
    const x2 = timeScale.timeToCoordinate(rulerPoints.end.time);
    const y2 = candleSeries.priceToCoordinate(rulerPoints.end.price);

    if ([x1, y1, x2, y2].some(value => value === null || !Number.isFinite(value))) {
      return;
    }

    const ns = "http://www.w3.org/2000/svg";

    function createSvgElement(tag, attributes = {}) {
      const element = document.createElementNS(ns, tag);

      for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
      }

      rulerSvg.appendChild(element);
      return element;
    }

    createSvgElement("line", {
      x1, y1, x2, y2,
      stroke: "#4f9cff",
      "stroke-width": "2",
      "stroke-dasharray": "6 4"
    });

    for (const [x, y] of [[x1, y1], [x2, y2]]) {
      createSvgElement("circle", {
        cx: x,
        cy: y,
        r: "5",
        fill: "#111820",
        stroke: "#4f9cff",
        "stroke-width": "2"
      });
    }

    const label = createSvgElement("text", {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2 - 12,
      fill: "#ffffff",
      "font-size": "11",
      "font-weight": "700",
      "text-anchor": "middle",
      stroke: "#111820",
      "stroke-width": "4",
      "paint-order": "stroke"
    });

    label.textContent = rulerPoints.label;
  }

  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;

    chart.applyOptions({
      width: Math.floor(width),
      height: Math.floor(height)
    });

    renderRuler();
  });

  resizeObserver.observe(container);

  chart.subscribeClick(param => {
    clickHandler?.(param);
  });

  chart.timeScale().subscribeVisibleLogicalRangeChange(renderRuler);

  return {
    chart,
    candleSeries,
    trendlineSeries,

    setClickHandler(handler) {
      clickHandler = handler;
    },

    setRuler(start, end, label) {
      rulerPoints = { start, end, label };
      renderRuler();
    },

    clearRuler() {
      rulerPoints = null;
      rulerSvg.replaceChildren();
    },

    setCandles(candles, initialVisibleCount = 150, preserveRange = false) {
      const previousRange = preserveRange
        ? chart.timeScale().getVisibleLogicalRange()
        : null;

      candleSeries.setData(
        candles.map(({ time, open, high, low, close }) => ({
          time, open, high, low, close
        }))
      );

      if (previousRange) {
        chart.timeScale().setVisibleLogicalRange(previousRange);
      } else {
        const firstVisible = Math.max(0, candles.length - initialVisibleCount);

        chart.timeScale().setVisibleLogicalRange({
          from: firstVisible,
          to: Math.max(0, candles.length - 1) + 8
        });
      }

      renderRuler();
    },

    updateCandle(candle) {
      candleSeries.update({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close
      });

      renderRuler();
    },

    setTrendline(points) {
      trendlineSeries.setData(points);
    },

    clearTrendline() {
      trendlineSeries.setData([]);
    },

    destroy() {
      resizeObserver.disconnect();
      chart.remove();
    }
  };
}
