import {
    DOCUMENT_VARIABLE_MAP
}
from "./documentVariableMap.js";



/*
=========================================
OBTENER VALOR DESDE UNA RUTA
=========================================
*/

export function obtenerValorRuta(
    objeto,
    ruta
) {

    if (!objeto || !ruta)
        return null;

    return ruta
        .split(".")
        .reduce(

            (
                actual,
                propiedad
            ) => {

                if (
                    actual === null ||
                    actual === undefined
                ) {

                    return null;

                }

                return actual[
                    propiedad
                ];

            },

            objeto

        );

}



/*
=========================================
CONSTRUIR VARIABLES
=========================================
*/

export function construirVariables(
    datos
) {

    const variables = {};

    Object
        .entries(
            DOCUMENT_VARIABLE_MAP
        )
        .forEach(

            ([
                variable,
                ruta
            ]) => {

                const valor =
                    obtenerValorRuta(
                        datos,
                        ruta
                    );

                variables[
                    variable
                ] =
                    valor ??
                    "";

            }

        );

    return variables;

}



/*
=========================================
OBTENER VARIABLES UTILIZADAS
EN UNA PLANTILLA
=========================================
*/

export function obtenerVariablesPlantilla(
    contenido
) {

    if (!contenido)
        return [];

    const matches =
        contenido.match(
            /{{(.*?)}}/g
        );

    if (!matches)
        return [];

    return [

        ...new Set(

            matches.map(

                item =>
                    item
                        .replace(
                            "{{",
                            ""
                        )
                        .replace(
                            "}}",
                            ""
                        )
                        .trim()

            )

        )

    ];

}



/*
=========================================
REEMPLAZAR VARIABLES
=========================================
*/

export function reemplazarVariables(
    contenido,
    variables
) {

    if (!contenido)
        return "";

    let resultado =
        contenido;

    Object
        .entries(
            variables
        )
        .forEach(

            ([
                variable,
                valor
            ]) => {

                const regex =
                    new RegExp(

                        `{{\\s*${variable}\\s*}}`,

                        "g"

                    );

                resultado =
                    resultado.replace(

                        regex,

                        valor ?? ""

                    );

            }

        );

    return resultado;

}
