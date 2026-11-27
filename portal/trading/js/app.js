import { AnchorManager } from "/portal/trading/js/anchorManager.js";
import { createChartManager } from "/portal/trading/js/chartManager.js";
import { createBinanceMarketData } from "/portal/trading/js/binanceMarketData.js";
import {
        createTrendline,
        projectTrendline,
        detectBreakout
      } from "/portal/trading/js/trendlineEngine.js";

const $ = selector => document.querySelector(selector);
const elements = {
  chart: $("#chart"),
  symbol: $("#symbolSelect"),
  timeframe: $("#timeframeSelect"),
  anchorButton: $("#anchorModeButton"),
  resetButton: $("#resetButton"),
  instructions: $("#chartInstructions"),
  chartSymbol: $("#chartSymbol"),
  chartState: $("#chartState"),
  chartDescription: $("#chartDescription"),
  marketBadge: $("#marketBadge"),
  anchorCount: $("#anchorCount"),
  anchorOne: $("#anchorOne"),
  anchorTwo: $("#anchorTwo"),
  lineSummary: $("#lineSummary"),
  activityLog: $("#activityLog"),
  contactTolerance: $("#contactTolerance"),
  breakoutThreshold: $("#breakoutThreshold"),

  breakoutStatus: $("#breakoutStatus"),
  breakoutDirection: $("#breakoutDirection"),
  breakoutDetails: $("#breakoutDetails"),

  rulerButton: $("#rulerButton")
  
};


const TRENDLINE_PROJECTION_CANDLES = 20;


let candles = [];
let currentLine = null;

let breakoutDetector = null;

let rulerMode = false;
let rulerStart = null;

let chartManager;
let marketData = null;
let loadSequence = 0;
const activity = [];

const TIMEFRAME_SECONDS = {
  "5m": 300,
  "15m": 900,
  "30m": 1800,
  "1h": 3600,
  "2h": 7200,
  "4h": 14400
};

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value);
}

function formatTime(unixSeconds) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "short", timeStyle: "short" }).format(new Date(unixSeconds * 1000));
}

function log(message) {
  activity.unshift({ message, time: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
  activity.splice(8);
  elements.activityLog.className = "activity-list";
  elements.activityLog.innerHTML = activity.map(item => `<div class="activity-item"><strong>${item.time}</strong> · ${item.message}</div>`).join("");
}

function setMessage(message) {
  elements.instructions.textContent = message;
  elements.chartState.textContent = message;
}



function formatDuration(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function setRulerMode(enabled) {
  rulerMode = enabled;
  rulerStart = null;

  elements.rulerButton.classList.toggle("is-active", enabled);
  elements.rulerButton.textContent = enabled ? "Salir de regla" : "Regla";

  if (enabled) {
    anchors.setEnabled(false);
    elements.anchorButton.classList.remove("is-active");
    elements.anchorButton.textContent = "Seleccionar anclas";
    setMessage("Regla activa. Haz clic en el primer punto de medición.");
  } else {
    setMessage("Modo regla desactivado.");
  }
}

function handleRulerClick(param) {
  if (!param.point || param.time === undefined) return;

  const price = chartManager.candleSeries.coordinateToPrice(
    param.point.y
  );

  if (!Number.isFinite(price) || price <= 0) return;

  const point = {
    time: param.time,
    price
  };

  if (!rulerStart) {
    rulerStart = point;

    setMessage(
      `Primer punto registrado: ${formatPrice(price)}. Selecciona el segundo punto.`
    );

    return;
  }

  const start = rulerStart;
  const end = point;

  const priceDifference = end.price - start.price;
  const percentage = (priceDifference / start.price) * 100;
  const timeDifference = Math.abs(end.time - start.time);

  const intervalSeconds =
    TIMEFRAME_SECONDS[elements.timeframe.value] || 900;

  const candleCount = Math.round(timeDifference / intervalSeconds);

  const direction = priceDifference > 0
    ? "ALCISTA"
    : priceDifference < 0
      ? "BAJISTA"
      : "SIN VARIACIÓN";

  const sign = priceDifference > 0 ? "+" : "";

  const label =
    `${sign}${formatPrice(priceDifference)} (${sign}${percentage.toFixed(2)}%) · ` +
    `${candleCount} velas · ${formatDuration(timeDifference)}`;

  chartManager.setRuler(start, end, label);

  log(
    `Regla ${direction} · ${label}.`
  );

  setMessage(
    `Medición completada: ${direction} · ${label}.`
  );

  rulerStart = null;
}




function setMarketBadge(state, message) {
  const color = state === "connected" ? "#29c58a" : state === "error" ? "#ef6674" : "#e7b45b";
  elements.marketBadge.innerHTML = `<span class="status-dot" style="background:${color};box-shadow:0 0 10px ${color}66"></span> ${message}`;
}

function updateAnchorDisplay(anchors) {
  elements.anchorCount.textContent = `${anchors.length} / 2`;
  [elements.anchorOne, elements.anchorTwo].forEach((row, index) => {
    const anchor = anchors[index];
    const small = row.querySelector("small");
    const state = row.querySelector(".anchor-state");
    small.textContent = anchor ? `${formatTime(anchor.time)} · ${formatPrice(anchor.price)}` : "Sin seleccionar";
    state.textContent = anchor ? "REGISTRADO" : "—";
    row.classList.toggle("is-set", Boolean(anchor));
  });
}

function resetLineDisplay() {
  currentLine = null;
  breakoutDetector = null;

  chartManager.clearTrendline();

  elements.lineSummary.innerHTML =
    '<span class="summary-label">ESTADO DE LA LÍNEA</span>' +
    '<strong>Sin definir</strong>' +
    '<small>Selecciona dos puntos cronológicos distintos.</small>';

  updateBreakoutDisplay(
    "SIN_RUPTURA",
    null,
    "La detección se activará cuando registres los dos puntos ancla."
  );
}


function drawLine(anchors) {
  resetLineDisplay();
  if (anchors.length !== 2) return;

  try {
    currentLine = createTrendline(anchors[0], anchors[1]);

    activateBreakoutDetector();
    
    updateTrendlineProjection();

    
    elements.lineSummary.innerHTML = `<span class="summary-label">ESTADO DE LA LÍNEA</span><strong>${currentLine.direction}</strong><small>Pendiente: ${currentLine.slopePerSecond.toExponential(4)} precio/segundo<br>Proyección: 40 velas hacia adelante</small>`;
    log(`Línea ${currentLine.direction.toLowerCase()} creada con dos anclas.`);
  } catch (error) {
    elements.lineSummary.innerHTML = `<span class="summary-label">ERROR DE GEOMETRÍA</span><strong>No se pudo crear</strong><small>${error.message}</small>`;
    setMessage(error.message);
  }
}


function updateTrendlineProjection() {
  if (!currentLine || candles.length === 0) return;

  const lastTime = candles[candles.length - 1].time;

  const intervalSeconds =
    TIMEFRAME_SECONDS[elements.timeframe.value] || 900;

  const futureTime = lastTime + intervalSeconds * TRENDLINE_PROJECTION_CANDLES;

  const projectedPoints = projectTrendline(
    currentLine,
    futureTime,
    intervalSeconds,
    lastTime
  );

  chartManager.setTrendline(projectedPoints);
}


function updateBreakoutDisplay(state, direction = null, details = "") {
  const labels = {
    SIN_RUPTURA: "SIN RUPTURA",
    RUPTURA_POTENCIAL: "RUPTURA POTENCIAL",
    RUPTURA_CONFIRMADA: "RUPTURA CONFIRMADA"
  };

  elements.breakoutStatus.querySelector("strong").textContent =
    labels[state];

  elements.breakoutDirection.textContent = direction || "—";

  elements.breakoutDetails.textContent = details;
}

function activateBreakoutDetector() {
  breakoutDetector = {
    activatedAt: Date.now(),
    triggered: false,
    potentialCandleTime: null,
    potentialDirection: null,
    confirmedCandleTime: null
  };

  updateBreakoutDisplay(
    "SIN_RUPTURA",
    null,
    "Detector activo. Esperando una ruptura del umbral configurado."
  );

  log("Detector de rupturas activado.");
}

function evaluateBreakout(candle) {
  if (!currentLine || !breakoutDetector) return;
  if (breakoutDetector.triggered) return;

  // Solo se evalúan velas cuyo cierre ocurre después
  // de la activación del setup.
  if (
    !Number.isFinite(candle.closeTime) ||
    candle.closeTime <= breakoutDetector.activatedAt
  ) {
    return;
  }

  const thresholdPct = Number(elements.breakoutThreshold.value);

  if (
    !Number.isFinite(thresholdPct) ||
    thresholdPct < 0 ||
    thresholdPct > 10
  ) {
    return;
  }

  // Para velas abiertas se utiliza el instante actual.
  // Para velas cerradas se utiliza su timestamp de cierre.
  const evaluationTime = candle.isClosed
    ? Math.floor(candle.closeTime / 1000)
    : Math.floor(Date.now() / 1000);

  const linePrice = currentLine.priceAt(evaluationTime);

  const result = detectBreakout(
    candle,
    linePrice,
    thresholdPct
  );

  // VELA ABIERTA: solamente ruptura potencial.
  if (!candle.isClosed) {
    const direction = result.potentialDirection;

    if (!direction) {
      breakoutDetector.potentialCandleTime = null;
      breakoutDetector.potentialDirection = null;

      updateBreakoutDisplay(
        "SIN_RUPTURA",
        null,
        "Esperando una ruptura del umbral configurado."
      );

      return;
    }

    const isNewPotential =
      breakoutDetector.potentialCandleTime !== candle.time ||
      breakoutDetector.potentialDirection !== direction;

    breakoutDetector.potentialCandleTime = candle.time;
    breakoutDetector.potentialDirection = direction;

    updateBreakoutDisplay(
      "RUPTURA_POTENCIAL",
      direction,
      `La vela actual ha atravesado el umbral del ${thresholdPct.toFixed(2)} %. Esperando cierre.`
    );

    if (isNewPotential) {
      log(`Ruptura potencial ${direction} detectada.`);
    }

    return;
  }

  // VELA CERRADA: confirmar o descartar.
  const confirmedDirection = result.confirmedDirection;

  breakoutDetector.potentialCandleTime = null;
  breakoutDetector.potentialDirection = null;

  if (!confirmedDirection) {
    updateBreakoutDisplay(
      "SIN_RUPTURA",
      null,
      "La vela cerró sin superar el umbral. Ruptura potencial descartada."
    );

    log("Ruptura potencial descartada tras el cierre de la vela.");
    return;
  }

  // Evitar duplicar una confirmación.
  if (breakoutDetector.confirmedCandleTime === candle.time) return;

  breakoutDetector.confirmedCandleTime = candle.time;
  breakoutDetector.triggered = true;

  updateBreakoutDisplay(
    "RUPTURA_CONFIRMADA",
    confirmedDirection,
    `Cierre confirmado. Señal ${confirmedDirection} generada. No se enviaron órdenes.`
  );

  log(
    `RUPTURA ${confirmedDirection} CONFIRMADA · ` +
    `Cierre: ${formatPrice(candle.close)} · ` +
    `Línea: ${formatPrice(linePrice)} · ` +
    `Umbral: ${thresholdPct.toFixed(2)} %.`
  );

  setMessage(
    `Ruptura ${confirmedDirection} confirmada. Señal registrada; ejecución desactivada.`
  );
}


function onSnapshot(nextCandles, preserveRange = false) {
  candles = nextCandles;
  chartManager.setCandles(candles, 150, preserveRange);
  updateTrendlineProjection();
}

function onCandle(candle, meta) {
  const index = candles.findIndex(item => item.time === candle.time);
  if (index >= 0) candles[index] = candle;
  else {
    candles.push(candle);
    candles = candles.slice(-1500);
  }
  chartManager.updateCandle(candle);
  updateTrendlineProjection();

  evaluateBreakout(candle);
  

  if (candle.isClosed) {
    log(`Vela ${elements.symbol.value} ${elements.timeframe.value} cerrada · ${formatTime(candle.time)} · C: ${formatPrice(candle.close)}.`);
    setMessage("Última vela cerrada confirmada. El gráfico continúa en tiempo real.");
  }
}

async function refreshChart() {
  const sequence = ++loadSequence;
  if (marketData) marketData.stop();
  marketData = null;
  candles = [];

  setRulerMode(false);
  chartManager.clearRuler();
  
  anchors.reset();
  anchors.setEnabled(false);
  resetLineDisplay();
  elements.anchorButton.classList.remove("is-active");
  elements.anchorButton.textContent = "Seleccionar anclas";

  const symbol = elements.symbol.value;
  const interval = elements.timeframe.value;
  elements.chartSymbol.innerHTML = `${symbol} <span>·</span> ${interval}`;
  elements.chartDescription.textContent = "Binance USDⓈ-M Futures · datos reales de mercado";
  setMarketBadge("loading", "CARGANDO BINANCE FUTURES");
  setMessage(`Conectando con Binance para cargar ${symbol} ${interval}…`);

  let hasInitialSnapshot = false;
  const service = createBinanceMarketData({
    symbol,
    interval,
    onSnapshot: nextCandles => {
      if (sequence !== loadSequence) return;
      onSnapshot(nextCandles, hasInitialSnapshot);
      hasInitialSnapshot = true;
    },
    onCandle: (candle, meta) => {
      if (sequence !== loadSequence) return;
      onCandle(candle, meta);
    },
    onStatus: ({ status, message }) => {
      if (sequence !== loadSequence) return;
      const badgeState = status === "connected" ? "connected" : status === "error" ? "error" : "loading";
      const badgeText = status === "connected"
        ? "BINANCE FUTURES · EN VIVO"
        : status === "reconnecting"
          ? "RECONECTANDO"
          : status === "error"
            ? "ERROR DE CONEXIÓN"
            : status === "connected-warning"
              ? "BINANCE CONECTADO · AVISO"
              : status === "warning"
                ? "AVISO DE DATOS"
                : "CONECTANDO BINANCE";
      setMarketBadge(badgeState, badgeText);
      elements.chartState.textContent = message;
      if (status === "error" || status === "connected-warning" || status === "warning") log(message);
    }
  });
  marketData = service;

  try {
    await service.start();
    if (sequence !== loadSequence) service.stop();
    else log(`${symbol} ${interval}: historial real cargado (${candles.length} velas solicitadas hasta 1.000).`);
  } catch (error) {
    if (sequence !== loadSequence || error.name === "AbortError") return;
    setMarketBadge("error", "BINANCE NO DISPONIBLE");
    setMessage(`No se pudieron cargar los datos de Binance: ${error.message}`);
    log(`Error al cargar mercado: ${error.message}`);
  }
}

chartManager = createChartManager(elements.chart);
const anchors = new AnchorManager({
  chart: chartManager.chart,
  candleSeries: chartManager.candleSeries,
  getCandles: () => candles,
  onChange: selected => {
    updateAnchorDisplay(selected);
    drawLine(selected);
  },
  onMessage: message => {
    setMessage(message);
    log(message);
  }
});


chartManager.setClickHandler(param => {
  if (rulerMode) {
    handleRulerClick(param);
    return;
  }

  anchors.handleClick(param);
});


refreshChart();

elements.anchorButton.addEventListener("click", () => {
  if (rulerMode) {
    setRulerMode(false);
  }

  const hasTwoAnchors = anchors.anchors.length === 2;
        
  if (hasTwoAnchors) {
    setMessage("Ya hay dos anclas. Reinicia la línea para crear otra.");
    return;
  }
  const enabled = !anchors.enabled;
  anchors.setEnabled(enabled);
  elements.anchorButton.classList.toggle("is-active", enabled);
  elements.anchorButton.textContent = enabled ? "Modo selección activo" : "Seleccionar anclas";
  setMessage(enabled ? "Haz clic sobre una vela cerrada para seleccionar P1." : "Selección de anclas pausada.");
});

elements.resetButton.addEventListener("click", () => {
  anchors.reset();
  anchors.setEnabled(false);
  elements.anchorButton.classList.remove("is-active");
  elements.anchorButton.textContent = "Seleccionar anclas";
  resetLineDisplay();
  setMessage("Línea reiniciada. Puedes seleccionar dos anclas nuevas.");
  log("Anclas y línea reiniciadas manualmente.");
});

elements.rulerButton.addEventListener("click", () => {
  setRulerMode(!rulerMode);
});

elements.symbol.addEventListener("change", refreshChart);
elements.timeframe.addEventListener("change", refreshChart);

for (const input of [elements.contactTolerance, elements.breakoutThreshold]) {
  input.addEventListener("change", () => {
    const value = Number(input.value);
    if (!Number.isFinite(value) || value < 0 || value > 10) {
      input.value = input === elements.contactTolerance ? "0.10" : "0.30";
      setMessage("Introduce un porcentaje entre 0 y 10.");
      return;
    }
    log(`${input === elements.contactTolerance ? "Tolerancia de contacto" : "Umbral de ruptura"}: ${value.toFixed(2)}%.`);
  });
}

window.addEventListener("beforeunload", () => {
  loadSequence += 1;
  marketData?.stop();
  chartManager.destroy();
});
