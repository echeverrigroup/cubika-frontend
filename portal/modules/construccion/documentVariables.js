export const DOCUMENT_VARIABLES = {

    SISTEMA: [
 
        "FECHA_ACTUAL",
        "FECHA_ACTUAL_TEXTO",
        "DIA_ACTUAL",
        "MES_ACTUAL",
        "ANIO_ACTUAL",

        "USUARIO_GENERADOR",

        "NUMERO_DOCUMENTO"

    ],

    EMPRESA: [

        "EMPRESA",
        "RUT_EMPRESA",
        "EMAIL_EMPRESA",

        "DIRECCION_EMPRESA",
        "COMUNA_EMPRESA",
        "REGION_EMPRESA",

        "REPRESENTANTE_LEGAL",
        "RUT_REPRESENTANTE",

        "DIRECCION_REPRESENTANTE",
        "COMUNA_REPRESENTANTE",
        "REGION_REPRESENTANTE"

    ],

    TRABAJADOR: [

        "TRABAJADOR",

        "NOMBRES",
        "APELLIDO_PATERNO",
        "APELLIDO_MATERNO",

        "RUT_TRABAJADOR",

        "SEXO",
        "ESTADO_CIVIL",
        "NACIONALIDAD",

        "FECHA_NACIMIENTO",
        "FECHA_NACIMIENTO_TEXTO",

        "EMAIL_TRABAJADOR",

        "DIRECCION_TRABAJADOR",
        "COMUNA_TRABAJADOR",
        "REGION_TRABAJADOR",

        "AFP",
        "SALUD",

        "BANCO",
        "TIPO_CUENTA",
        "NUMERO_CUENTA"

    ],

    OBRA: [

        "OBRA",

        "DESCRIPCION_OBRA",

        "DIRECCION_OBRA",
        "COMUNA_OBRA",
        "REGION_OBRA",

        "FECHA_INICIO_OBRA",
        "FECHA_TERMINO_OBRA"

    ],

    CARGO: [

        "CARGO",
        "DESCRIPCION_CARGO"

    ],

    CONTRATO: [

        "NUMERO_CONTRATO",

        "TIPO_CONTRATO",

        "FECHA_INICIO",
        "FECHA_TERMINO",

        "FECHA_INICIO_TEXTO",
        "FECHA_TERMINO_TEXTO",

        "SUELDO",
        "SUELDO_TEXTO",

        "JORNADA",

        "DISTRIBUCION_HORARIA",

        "CAUSAL_TERMINO",

        "OBSERVACIONES"

    ]

};


export const DOCUMENT_VARIABLE_DESCRIPTIONS = {

    EMPRESA:
        "Nombre de la empresa",

    RUT_EMPRESA:
        "RUT de la empresa",

    TRABAJADOR:
        "Nombre completo del trabajador",

    SUELDO:
        "Sueldo base",

    SUELDO_TEXTO:
        "Sueldo expresado en palabras"

};




export const ALL_DOCUMENT_VARIABLES =
    Object
        .values(DOCUMENT_VARIABLES)
        .flat();


export const DOCUMENT_VARIABLE_SET =
    new Set(
        ALL_DOCUMENT_VARIABLES
    );


export const DOCUMENT_CATEGORIES =
    Object.keys(
        DOCUMENT_VARIABLES
    );
