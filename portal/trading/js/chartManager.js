const TIMEFRAME_SECONDS = {
  "15m": 15 * 60,
  "30m": 30 * 60,
  "1h": 60 * 60,
  "2h": 2 * 60 * 60,
  "4h": 4 * 60 * 60
};

export function timeframeToSeconds(timeframe) {
  return TIMEFRAME_SECONDS[timeframe] ?? TIMEFRAME_SECONDS["15m"];
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function makeDemoCandles(symbol, timeframe, count = 240) {
  const seconds = timeframeToSeconds(timeframe);
  const end = Math.floor(Date.now() / seconds) * seconds - seconds;
  const seed = [...`${symbol}${timeframe}`].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  const base = symbol === "BTCUSDT" ? 67000 : symbol === "ETHUSDT" ? 3500 : 175;
  let previous = base;
  const candles = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const time = end - index * seconds;
    const drift = Math.sin((count - index) / 18) * base * 0.00065;
    const movement = (random() - 0.49) * base * 0.004 + drift;
    const open = previous;
    const close = Math.max(base * 0.2, open + movement);
    const wick = random() * base * 0.0018;
    const high = Math.max(open, close) + wick;
    const low = Math.min(open, close) - random() * base * 0.0018;
    candles.push({ time, open, high, low, close });
    previous = close;
  }
  return candles;
}

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
    setCandles(candles) {
      candleSeries.setData(candles);
      chart.timeScale().fitContent();
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
