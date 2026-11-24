export function createChartManager(container, onChartClick) {
  if (!window.LightweightCharts) throw new Error("No se pudo cargar Lightweight Charts desde CDN.");
  const { createChart, CandlestickSeries, LineSeries, ColorType } = window.LightweightCharts;
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
    rightPriceScale: { borderColor: "#293642", scaleMargins: { top: 0.12, bottom: 0.12 } },
    timeScale: { borderColor: "#293642", timeVisible: true, secondsVisible: false, rightOffset: 8 },
    crosshair: { mode: 0 },
    handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
    handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true }
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
    crosshairMarkerVisible: false
  });

  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    chart.applyOptions({ width: Math.floor(width), height: Math.floor(height) });
  });
  resizeObserver.observe(container);
  chart.subscribeClick(onChartClick);

  return {
    chart,
    candleSeries,
    trendlineSeries,
    setCandles(candles, initialVisibleCount = 150, preserveRange = false) {
      const previousRange = preserveRange ? chart.timeScale().getVisibleLogicalRange() : null;
      candleSeries.setData(candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));
      if (previousRange) {
        chart.timeScale().setVisibleLogicalRange(previousRange);
      } else {
        const firstVisible = Math.max(0, candles.length - initialVisibleCount);
        chart.timeScale().setVisibleLogicalRange({ from: firstVisible, to: Math.max(0, candles.length - 1) + 8 });
      }
    },
    updateCandle(candle) {
      candleSeries.update({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close
      });
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
