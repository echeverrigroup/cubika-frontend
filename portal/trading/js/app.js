import { AnchorManager } from "./anchorManager.js";
import { createChartManager, makeDemoCandles, timeframeToSeconds } from "./chartManager.js";
import { createTrendline, projectTrendline } from "./trendlineEngine.js";

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
  anchorCount: $("#anchorCount"),
  anchorOne: $("#anchorOne"),
  anchorTwo: $("#anchorTwo"),
  lineSummary: $("#lineSummary"),
  activityLog: $("#activityLog"),
  contactTolerance: $("#contactTolerance"),
  breakoutThreshold: $("#breakoutThreshold")
};

let candles = [];
let currentLine = null;
let chartManager;
const activity = [];

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value);
}

function formatTime(unixSeconds) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "short", timeStyle: "short" }).format(new Date(unixSeconds * 1000));
}

function log(message) {
  activity.unshift({ message, time: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
  activity.splice(8);
  elements.activityLog.innerHTML = activity.map(item => `<div class="activity-item"><strong>${item.time}</strong> · ${item.message}</div>`).join("");
}

function setMessage(message) {
  elements.instructions.textContent = message;
  elements.chartState.textContent = message;
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

function drawLine(anchors) {
  currentLine = null;
  chartManager.clearTrendline();
  if (anchors.length !== 2) {
    elements.lineSummary.innerHTML = '<span class="summary-label">ESTADO DE LA LÍNEA</span><strong>Sin definir</strong><small>Selecciona dos puntos cronológicos distintos.</small>';
    return;
  }

  try {
    currentLine = createTrendline(anchors[0], anchors[1]);
    const lastTime = candles[candles.length - 1].time;
    const futureTime = lastTime + timeframeToSeconds(elements.timeframe.value) * 40;
    chartManager.setTrendline(projectTrendline(currentLine, futureTime));
    elements.lineSummary.innerHTML = `<span class="summary-label">ESTADO DE LA LÍNEA</span><strong>${currentLine.direction}</strong><small>Pendiente: ${currentLine.slopePerSecond.toExponential(4)} precio/segundo<br>Proyección: 40 velas hacia adelante</small>`;
    log(`Línea ${currentLine.direction.toLowerCase()} creada con dos anclas.`);
  } catch (error) {
    elements.lineSummary.innerHTML = `<span class="summary-label">ERROR DE GEOMETRÍA</span><strong>No se pudo crear</strong><small>${error.message}</small>`;
    setMessage(error.message);
  }
}

function refreshChart() {
  candles = makeDemoCandles(elements.symbol.value, elements.timeframe.value);
  chartManager.setCandles(candles);
  chartManager.clearTrendline();
  currentLine = null;
  anchors.reset();
  elements.chartSymbol.innerHTML = `${elements.symbol.value} <span>·</span> ${elements.timeframe.value}`;
  elements.lineSummary.innerHTML = '<span class="summary-label">ESTADO DE LA LÍNEA</span><strong>Sin definir</strong><small>Selecciona dos puntos cronológicos distintos.</small>';
  elements.anchorButton.classList.remove("is-active");
  elements.anchorButton.textContent = "Seleccionar anclas";
  anchors.setEnabled(false);
  setMessage("Datos simulados cargados. Selecciona dos puntos ancla.");
}

chartManager = createChartManager(elements.chart, param => anchors.handleClick(param));
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

refreshChart();

elements.anchorButton.addEventListener("click", () => {
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
  chartManager.clearTrendline();
  currentLine = null;
  setMessage("Línea reiniciada. Puedes seleccionar dos anclas nuevas.");
  log("Anclas y línea reiniciadas manualmente.");
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

window.addEventListener("beforeunload", () => chartManager.destroy());
