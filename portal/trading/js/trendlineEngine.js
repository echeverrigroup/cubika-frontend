
/**
 * Geometría pura de la línea de tendencia.
 * Todas las coordenadas temporales utilizan segundos Unix.
 */

export function createTrendline(anchorOne, anchorTwo) {
  if (!anchorOne || !anchorTwo) {
    throw new Error("Se requieren dos puntos ancla.");
  }

  if (
    !Number.isFinite(anchorOne.time) ||
    !Number.isFinite(anchorTwo.time)
  ) {
    throw new Error("Los timestamps no son válidos.");
  }

  if (
    !Number.isFinite(anchorOne.price) ||
    !Number.isFinite(anchorTwo.price)
  ) {
    throw new Error("Los precios no son válidos.");
  }

  if (anchorTwo.time <= anchorOne.time) {
    throw new Error(
      "El segundo punto debe ser cronológicamente posterior al primero."
    );
  }

  const slopePerSecond =
    (anchorTwo.price - anchorOne.price) /
    (anchorTwo.time - anchorOne.time);

  const direction =
    anchorTwo.price > anchorOne.price
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
      return anchorOne.price +
        slopePerSecond * (time - anchorOne.time);
    }
  });
}

/**
 * Genera puntos intermedios para que Lightweight Charts
 * represente correctamente los intervalos futuros.
 *
 * lastCandleTime: timestamp de la última vela disponible.
 * stepSeconds: duración del timeframe en segundos.
 */

export function projectTrendline(
  line,
  endTime,
  stepSeconds,
  lastCandleTime
) {
  if (
    !line ||
    !Number.isFinite(endTime) ||
    !Number.isFinite(stepSeconds) ||
    stepSeconds <= 0 ||
    !Number.isFinite(lastCandleTime)
  ) {
    return [];
  }

  const points = [
    {
      time: line.anchorOne.time,
      value: line.anchorOne.price
    },
    {
      time: line.anchorTwo.time,
      value: line.anchorTwo.price
    }
  ];

  // Generar un punto por cada intervalo futuro.
  let time = Math.max(
    lastCandleTime,
    line.anchorTwo.time
  ) + stepSeconds;

  while (time < endTime) {
    points.push({
      time,
      value: line.priceAt(time)
    });

    time += stepSeconds;
  }

  // Incorporar el extremo exacto de la proyección.
  if (endTime > lastCandleTime) {
    points.push({
      time: endTime,
      value: line.priceAt(endTime)
    });
  }

  return points;
}

/** Distancia porcentual entre el rango High-Low y la línea. */

export function distanceFromCandleRangePct(candle, linePrice) {
  if (
    !candle ||
    !Number.isFinite(linePrice) ||
    linePrice <= 0
  ) {
    return Infinity;
  }

  let distance = 0;

  if (linePrice < candle.low) {
    distance = candle.low - linePrice;
  } else if (linePrice > candle.high) {
    distance = linePrice - candle.high;
  }

  return (distance / linePrice) * 100;
}

export function isCandleContact(candle, linePrice, tolerancePct) {
  if (
    !candle ||
    !Number.isFinite(tolerancePct) ||
    tolerancePct < 0
  ) {
    return false;
  }

  return (
    distanceFromCandleRangePct(candle, linePrice) <= tolerancePct
  );
}



/**
 * Calcula los límites superior e inferior de ruptura.
 *
 * thresholdPct se expresa en porcentaje:
 * 0.30 significa 0.30%.
 */
export function calculateBreakoutLevels(linePrice, thresholdPct) {
  if (
    !Number.isFinite(linePrice) ||
    linePrice <= 0 ||
    !Number.isFinite(thresholdPct) ||
    thresholdPct < 0
  ) {
    throw new Error("Parámetros de ruptura no válidos.");
  }

  const distance = thresholdPct / 100;

  return {
    upper: linePrice * (1 + distance),
    lower: linePrice * (1 - distance)
  };
}

/**
 * Evalúa una vela respecto a la línea y su umbral.
 *
 * La mecha detecta una ruptura potencial.
 * El cierre confirma o descarta la ruptura.
 */
export function detectBreakout(candle, linePrice, thresholdPct) {
  if (
    !candle ||
    !Number.isFinite(candle.high) ||
    !Number.isFinite(candle.low) ||
    !Number.isFinite(candle.close)
  ) {
    return {
      potentialDirection: null,
      confirmedDirection: null
    };
  }

  const levels = calculateBreakoutLevels(linePrice, thresholdPct);

  const potentialShort = candle.low <= levels.lower;
  const potentialLong = candle.high >= levels.upper;

  let potentialDirection = null;

  if (potentialShort && potentialLong) {
    potentialDirection = "AMBIGUA";
  } else if (potentialShort) {
    potentialDirection = "SHORT";
  } else if (potentialLong) {
    potentialDirection = "LONG";
  }

  let confirmedDirection = null;

  if (candle.close <= levels.lower) {
    confirmedDirection = "SHORT";
  } else if (candle.close >= levels.upper) {
    confirmedDirection = "LONG";
  }

  return {
    potentialDirection,
    confirmedDirection,
    levels
  };
}
