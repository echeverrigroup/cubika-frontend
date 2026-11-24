/**
 * Geometría pura de la línea de tendencia.
 * Las coordenadas temporales se expresan en segundos Unix (apertura de vela).
 */
export function createTrendline(anchorOne, anchorTwo) {
  if (!anchorOne || !anchorTwo) throw new Error("Se requieren dos puntos ancla.");
  if (!Number.isFinite(anchorOne.time) || !Number.isFinite(anchorTwo.time)) {
    throw new Error("Los timestamps de los puntos ancla no son válidos.");
  }
  if (!Number.isFinite(anchorOne.price) || !Number.isFinite(anchorTwo.price)) {
    throw new Error("Los precios de los puntos ancla no son válidos.");
  }
  if (anchorTwo.time <= anchorOne.time) {
    throw new Error("El segundo punto debe ser cronológicamente posterior al primero.");
  }

  const slopePerSecond = (anchorTwo.price - anchorOne.price) / (anchorTwo.time - anchorOne.time);
  const direction = anchorTwo.price > anchorOne.price
    ? "ALCISTA"
    : anchorTwo.price < anchorOne.price
      ? "BAJISTA"
      : "HORIZONTAL";

  return Object.freeze({
    anchorOne: Object.freeze({ ...anchorOne }),
    anchorTwo: Object.freeze({ ...anchorTwo }),
    slopePerSecond,
    direction,
    priceAt(time) {
      return anchorOne.price + slopePerSecond * (time - anchorOne.time);
    }
  });
}

export function projectTrendline(line, endTime) {
  if (!line || !Number.isFinite(endTime)) return [];
  const points = [
    { time: line.anchorOne.time, value: line.anchorOne.price },
    { time: line.anchorTwo.time, value: line.anchorTwo.price }
  ];
  if (endTime > line.anchorTwo.time) {
    points.push({ time: endTime, value: line.priceAt(endTime) });
  }
  return points;
}

/** Distancia porcentual mínima entre el rango High-Low y la línea. */
export function distanceFromCandleRangePct(candle, linePrice) {
  if (!candle || !Number.isFinite(linePrice) || linePrice <= 0) return Infinity;
  let distance = 0;
  if (linePrice < candle.low) distance = candle.low - linePrice;
  else if (linePrice > candle.high) distance = linePrice - candle.high;
  return (distance / linePrice) * 100;
}

export function isCandleContact(candle, linePrice, tolerancePct) {
  if (!candle || !Number.isFinite(tolerancePct) || tolerancePct < 0) return false;
  return distanceFromCandleRangePct(candle, linePrice) <= tolerancePct;
}
