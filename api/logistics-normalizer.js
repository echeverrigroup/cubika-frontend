// ==============================
// LOGISTICS NORMALIZER
// ==============================

export function normalizarDatosLogisticos(registros) {

  return registros.map(registro => {

    return {
      sku: limpiarTexto(registro.sku),

      quantity: normalizarCantidad(registro.quantity),

      weight: normalizarPeso(registro.weight)
    };

  });

}



// ==============================
// LIMPIEZA DE TEXTO
// ==============================

function limpiarTexto(valor) {

  if (!valor) return null;

  return String(valor)
    .trim()
    .toUpperCase();

}



// ==============================
// NORMALIZAR CANTIDAD
// ==============================

function normalizarCantidad(valor) {

  if (valor === null || valor === undefined) return null;

  const numero = Number(valor);

  if (isNaN(numero)) return null;

  return numero;

}



// ==============================
// NORMALIZAR PESO
// ==============================

function normalizarPeso(valor) {

  if (!valor) return null;

  let texto = String(valor).toLowerCase().trim();

  // reemplazar coma decimal
  texto = texto.replace(",", ".");

  // detectar unidad
  let unidad = "kg";

  if (texto.includes("gr")) unidad = "g";
  if (texto.includes("kg")) unidad = "kg";

  // extraer número
  const numero = parseFloat(texto);

  if (isNaN(numero)) return null;

  // convertir gramos a kg
  let peso = numero;

  if (unidad === "g") {
    peso = numero / 1000;
    unidad = "kg";
  }

  return {
    value: peso,
    unit: unidad
  };

}
