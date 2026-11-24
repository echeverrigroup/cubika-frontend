export class AnchorManager {
  constructor({ chart, candleSeries, getCandles, onChange, onMessage }) {
    this.chart = chart;
    this.candleSeries = candleSeries;
    this.getCandles = getCandles;
    this.onChange = onChange;
    this.onMessage = onMessage;
    this.enabled = false;
    this.anchors = [];
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  reset() {
    this.anchors = [];
    this.onChange([...this.anchors]);
  }

  handleClick(param) {
    if (!this.enabled || !param?.point || param.time == null) return;
    const price = this.candleSeries.coordinateToPrice(param.point.y);
    if (!Number.isFinite(price)) {
      this.onMessage("Haz clic dentro del área de precios del gráfico.");
      return;
    }

    const candle = this.getCandles().find(item => item.time === param.time);
    if (!candle) {
      this.onMessage("No se encontró una vela cerrada en esa coordenada.");
      return;
    }
    if (price < candle.low || price > candle.high) {
      this.onMessage("El precio seleccionado debe estar dentro del rango High–Low de la vela.");
      return;
    }

    const point = { time: param.time, price };
    if (this.anchors.length === 0) {
      this.anchors = [point];
      this.onChange([...this.anchors]);
      this.onMessage("P1 registrado. Selecciona una vela posterior para P2.");
      return;
    }

    if (this.anchors.length === 1) {
      if (point.time <= this.anchors[0].time) {
        this.onMessage("P2 debe estar en una vela cronológicamente posterior a P1.");
        return;
      }
      this.anchors = [...this.anchors, point];
      this.enabled = false;
      this.onChange([...this.anchors]);
      this.onMessage("Dos puntos registrados. Línea calculada y proyectada.");
      return;
    }

    this.onMessage("Ya existen dos anclas. Reinicia la línea para seleccionar otras.");
  }
}
