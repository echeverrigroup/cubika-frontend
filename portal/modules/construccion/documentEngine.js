import {
    DOCUMENT_VARIABLE_MAP
}
from "./documentVariableMap.js";


import {
    DOCUMENT_VARIABLE_SET,
    ALL_DOCUMENT_VARIABLES
}
from "./documentVariables.js";




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

    let d;

    if (
        typeof fecha === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
            fecha
        )
    ) {

        const [
            anio,
            mes,
            dia
        ] = fecha
            .split("-")
            .map(Number);

        d = new Date(
            anio,
            mes - 1,
            dia
        );

    }
    else {

        d =
            new Date(
                fecha
            );

    }

    if (
        isNaN(
            d.getTime()
        )
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


const UNIDADES = [

    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve"

];

const DECENAS = [

    "",
    "diez",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa"

];

const CENTENAS = [

    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos"

];


function convertirMenor100(
    numero
) {

    const especiales = {

        0: "",
        10: "diez",
        11: "once",
        12: "doce",
        13: "trece",
        14: "catorce",
        15: "quince",
        16: "dieciséis",
        17: "diecisiete",
        18: "dieciocho",
        19: "diecinueve",
        20: "veinte",
        21: "veintiuno",
        22: "veintidós",
        23: "veintitrés",
        24: "veinticuatro",
        25: "veinticinco",
        26: "veintiséis",
        27: "veintisiete",
        28: "veintiocho",
        29: "veintinueve"

    };

    if (
        especiales[numero]
    ) {

        return especiales[
            numero
        ];

    }

    const decena =
        Math.floor(
            numero / 10
        );

    const unidad =
        numero % 10;

    if (!unidad)
        return DECENAS[
            decena
        ];

    return `${DECENAS[
        decena
    ]} y ${
        UNIDADES[
            unidad
        ]
    }`;

}


function convertirMenor1000(
    numero
) {

    if (numero === 0)
        return "";

    if (numero === 100)
        return "cien";

    const centenas =
        Math.floor(
            numero / 100
        );

    const resto =
        numero % 100;

    let texto = "";

    if (
        centenas
    ) {

        texto +=
            CENTENAS[
                centenas
            ];

    }

    if (
        resto
    ) {

        if (texto)
            texto += " ";

        texto +=
            convertirMenor100(
                resto
            );

    }

    return texto;

}


export function numeroALetras(
    numero
) {

    numero =
        Number(numero);

    if (
        !numero
    ) {

        return "Cero pesos";
    }

    let texto = "";



    const millones =
        Math.floor(
            numero /
            1000000
        );

    numero =
        numero %
        1000000;



    const miles =
        Math.floor(
            numero /
            1000
        );

    const resto =
        numero %
        1000;



    if (millones) {

        if (
            millones === 1
        ) {

            texto +=
                "un millón";

        }
        else {

            texto +=
                `${convertirMenor1000(
                    millones
                )} millones`;

        }

    }



    if (miles) {

        if (texto)
            texto += " ";

        if (
            miles === 1
        ) {

            texto +=
                "mil";

        }
        else {

            texto +=
                `${convertirMenor1000(
                    miles
                )} mil`;

        }

    }



    if (resto) {

        if (texto)
            texto += " ";

        texto +=
            convertirMenor1000(
                resto
            );

    }



    texto =
        texto.trim();

    texto =
        texto.charAt(0)
            .toUpperCase()
        +
        texto.slice(1);



    return `${texto} pesos`;

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


function construirDistribucionHoraria(
    distribuciones = []
) {

    if (
        !Array.isArray(
            distribuciones
        )
    ) {

        return "";

    }


    const TEXTO_COLACION =
        "con una hora de colación.";


    return distribuciones

        .filter(
            distribucion =>
                distribucion?.texto
                    ?.trim()
        )

        .map(
            distribucion => {

                const texto =
                    distribucion
                        .texto
                        .trim();


                if (
                    distribucion.colacion
                ) {

                    return `${texto}, ${TEXTO_COLACION}`;

                }


                return `${texto}.`;

            }

        )

        .join("\n");

}


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



     variables.SUELDO_FORMATO =
    
        formatearMoneda(
            variables.SUELDO
        );


    variables.DISTRIBUCION_HORARIA =

        construirDistribucionHoraria(
    
            datos.contrato
                ?.distribucion_horaria
    
        );
    
    
    variables.SUELDO_TEXTO =
    
        numeroALetras(
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

                        `<strong>${valor ?? ""}</strong>`

                    );

            }

        );

    return resultado;

}



export function validarPlantilla(
    contenido = ""
) {

    const variables =
        obtenerVariablesPlantilla(
            contenido
        );

    const errores = [];

    variables.forEach(
        variable => {

            if (
                !DOCUMENT_VARIABLE_SET.has(
                    variable
                )
            ) {

                errores.push({

                    variable,

                    mensaje:
                        `❌ {{${variable}}} no es una variable válida.`

                });

            }

        }
    );

    return {

        valido:
            errores.length === 0,

        variables,

        errores,

        variablesInvalidas:
            errores.map(
                x => x.variable
            )

    };


    return {

        valido:
            errores.length === 0,
    
        variables,
    
        errores,
    
        cantidadVariables:
            variables.length
    
    };

}


