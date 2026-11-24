const REST_BASE_URL = "https://fapi.binance.com/fapi/v1/klines";
const WEBSOCKET_BASE_URL = "wss://fstream.binance.com/market/ws";
const HISTORY_LIMIT = 1000;
const MAX_CANDLES = 1500;

function normalizeRestKline(row, now = Date.now()) {
  const closeTime = Number(row[6]);
  return {
    time: Math.floor(Number(row[0]) / 1000),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    closeTime,
    isClosed: closeTime < now
  };
}

function normalizeStreamKline(kline) {
  return {
    time: Math.floor(Number(kline.t) / 1000),
    open: Number(kline.o),
    high: Number(kline.h),
    low: Number(kline.l),
    close: Number(kline.c),
    volume: Number(kline.v),
    closeTime: Number(kline.T),
    isClosed: Boolean(kline.x)
  };
}

function validateCandle(candle) {
  return [candle.time, candle.open, candle.high, candle.low, candle.close].every(Number.isFinite)
    && candle.low <= candle.high
    && candle.low <= Math.min(candle.open, candle.close)
    && candle.high >= Math.max(candle.open, candle.close);
}

async function fetchKlines(symbol, interval, limit, signal) {
  const url = new URL(REST_BASE_URL);
  url.search = new URLSearchParams({ symbol, interval, limit: String(limit) }).toString();

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.msg || body.message || "";
    } catch {
      // Binance puede responder con un cuerpo no JSON ante errores de gateway.
    }
    throw new Error(`Binance REST respondió HTTP ${response.status}${detail ? `: ${detail}` : ""}.`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("Respuesta histórica de Binance no válida.");

  const candles = rows.map(row => normalizeRestKline(row)).filter(validateCandle);
  if (candles.length === 0) throw new Error("Binance no devolvió velas para este activo y timeframe.");
  return candles;
}

function mergeCandles(current, incoming) {
  const byTime = new Map(current.map(candle => [candle.time, candle]));
  for (const candle of incoming) byTime.set(candle.time, candle);
  return [...byTime.values()]
    .sort((a, b) => a.time - b.time)
    .slice(-MAX_CANDLES);
}

/**
 * Datos públicos de USDⓈ-M Futures. No utiliza API Key ni permisos de cuenta.
 * REST carga el historial; WebSocket actualiza la vela en formación y confirma cierres.
 */
export function createBinanceMarketData({ symbol, interval, onSnapshot, onCandle, onStatus }) {
  let candles = [];
  let socket = null;
  let reconnectTimer = null;
  let reconnectDelay = 1000;
  let stopped = false;
  let generation = 0;
  let abortController = null;

  const setStatus = (status, message) => onStatus?.({ status, message });

  function publishSnapshot() {
    onSnapshot?.([...candles]);
  }

  function upsertCandle(candle, source = "websocket") {
    if (!validateCandle(candle)) return;
    const previousLast = candles[candles.length - 1];

    if (previousLast && candle.time < previousLast.time) {
      candles = mergeCandles(candles, [candle]);
      publishSnapshot();
      return;
    }

    if (previousLast && candle.time === previousLast.time) {
      candles[candles.length - 1] = candle;
    } else {
      candles.push(candle);
      candles = candles.slice(-MAX_CANDLES);
    }

    onCandle?.(candle, { source, candles: [...candles] });
  }

  async function resyncRecentCandles(activeGeneration) {
    const controller = new AbortController();
    abortController = controller;
    const recent = await fetchKlines(symbol, interval, 5, controller.signal);
    if (stopped || activeGeneration !== generation) return;
    // El snapshot reciente rellena huecos; los updates WebSocket recibidos mientras
    // se ejecutaba REST tienen prioridad para no retroceder una vela en formación.
    candles = mergeCandles(recent, candles);
    publishSnapshot();
  }

  function scheduleReconnect() {
    if (stopped || reconnectTimer) return;
    const delay = reconnectDelay;
    reconnectDelay = Math.min(reconnectDelay * 2, 30000);
    setStatus("reconnecting", `Conexión interrumpida. Reintentando en ${Math.ceil(delay / 1000)} s.`);
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      openSocket();
    }, delay);
  }

  function openSocket() {
    if (stopped) return;
    const activeGeneration = generation;
    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    const url = `${WEBSOCKET_BASE_URL}/${stream}`;

    setStatus("connecting", "Conectando al flujo de mercado de Binance…");
    try {
      socket = new WebSocket(url);
    } catch (error) {
      setStatus("error", `No se pudo abrir WebSocket: ${error.message}`);
      scheduleReconnect();
      return;
    }

    socket.addEventListener("open", async () => {
      if (stopped || activeGeneration !== generation) return;
      reconnectDelay = 1000;
      setStatus("connected", "Binance Futures conectado · actualización en tiempo real.");
      try {
        await resyncRecentCandles(activeGeneration);
      } catch (error) {
        if (error.name !== "AbortError" && !stopped) {
          setStatus("connected-warning", `WebSocket activo; no se pudo sincronizar el historial reciente: ${error.message}`);
        }
      }
    });

    socket.addEventListener("message", event => {
      if (stopped || activeGeneration !== generation) return;
      try {
        const payload = JSON.parse(event.data);
        const kline = payload.k;
        if (!kline) return;
        upsertCandle(normalizeStreamKline(kline));
        if (kline.x) {
          setStatus("connected", "Binance Futures conectado · última vela cerrada confirmada.");
        }
      } catch (error) {
        setStatus("warning", `No se pudo procesar una actualización de Binance: ${error.message}`);
      }
    });

    socket.addEventListener("error", () => {
      if (!stopped) setStatus("connected-warning", "WebSocket reportó un error. Esperando reconexión.");
    });

    socket.addEventListener("close", () => {
      if (stopped || activeGeneration !== generation) return;
      socket = null;
      scheduleReconnect();
    });
  }

  async function start() {
    setStatus("loading", `Descargando ${HISTORY_LIMIT} velas históricas de ${symbol} ${interval}…`);
    abortController = new AbortController();
    const initial = await fetchKlines(symbol, interval, HISTORY_LIMIT, abortController.signal);
    if (stopped) return;
    candles = initial;
    publishSnapshot();
    generation += 1;
    openSocket();
  }

  function stop() {
    stopped = true;
    generation += 1;
    if (abortController) abortController.abort();
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
    if (socket) {
      socket.onclose = null;
      socket.close(1000, "Market data stopped");
      socket = null;
    }
  }

  return { start, stop };
}
