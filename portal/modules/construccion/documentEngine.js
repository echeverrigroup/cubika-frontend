import {
    DOCUMENT_VARIABLE_MAP
}
from "./documentVariableMap.js";


const MESES = [

    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"

];


export function formatearFechaTexto(
    fecha
) {

    if (!fecha)
        return "";

    const d =
        new Date(fecha);

    if (
        isNaN(d)
    ) {

        return "";
    }

    const dia =
        d.getDate();

    const mes =
        MESES[
            d.getMonth()
        ];

    const anio =
        d.getFullYear();

    return `${dia} de ${mes} de ${anio}`;

}


export function obtenerNombreCompleto(
    trabajador
) {

    if (!trabajador)
        return "";

    return [

        trabajador.nombres,

        trabajador.apellido_paterno,

        trabajador.apellido_materno

    ]
        .filter(Boolean)
        .join(" ");

}


export function formatearMoneda(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";
    }

    return Number(
        valor
    ).toLocaleString(
        "es-CL"
    );

}






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

                variables[
                    variable
                ] =

                    obtenerValorRuta(
                        datos,
                        ruta
                    ) ?? "";

            }

        );



    variables.TRABAJADOR =

        obtenerNombreCompleto(
            datos.trabajador
        );



    variables.FECHA_ACTUAL =

        new Date()
            .toISOString()
            .split("T")[0];



    variables.FECHA_ACTUAL_TEXTO =

        formatearFechaTexto(
            new Date()
        );



    variables.FECHA_NACIMIENTO_TEXTO =

        formatearFechaTexto(

            variables
                .FECHA_NACIMIENTO

        );



    variables.FECHA_INICIO_TEXTO =

        formatearFechaTexto(

            variables
                .FECHA_INICIO

        );



    variables.FECHA_TERMINO_TEXTO =

        formatearFechaTexto(

            variables
                .FECHA_TERMINO

        );



    variables.SUELDO_TEXTO =

        formatearMoneda(

            variables.SUELDO

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
