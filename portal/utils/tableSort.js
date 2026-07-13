let sortColumn = null;

let sortDirection = "asc";


export function getSortState() {

    return {

        sortColumn,

        sortDirection

    };

}


export function setSortColumn(column) {

    if (
        sortColumn === column
    ) {

        sortDirection =

            sortDirection === "asc"

                ? "desc"

                : "asc";

    }

    else {

        sortColumn =
            column;

        sortDirection =
            "asc";

    }

}


function obtenerValor(
    objeto,
    ruta
) {

    return ruta

        .split(".")

        .reduce(

            (
                acc,
                key
            ) =>

                acc?.[key],

            objeto

        );

}


export function ordenarDatos(
    datos
) {

    if (!sortColumn)
        return datos;


    return [

        ...datos

    ].sort((a, b) => {

        let valorA =
            obtenerValor(
                a,
                sortColumn
            );

        let valorB =
            obtenerValor(
                b,
                sortColumn
            );


        valorA =
            (valorA ?? "")
                .toString()
                .toUpperCase();

        valorB =
            (valorB ?? "")
                .toString()
                .toUpperCase();


        const resultado =

            valorA.localeCompare(
                valorB
            );


        return (

            sortDirection === "asc"
        
                ? resultado
        
                : -resultado
        
        );
    });

}


export function inicializarTableSort(

    callbackRecargar

) {

    document

        .querySelectorAll(
            ".sortable"
        )

        .forEach(th => {

            th.addEventListener(

                "click",

                () => {

                    setSortColumn(

                        th.dataset.column

                    );

                    callbackRecargar();

                }

            );

        });

}



export function getSortClass(
    columna
) {

    if (
        columna !== sortColumn
    )

        return "";


    return

        sortDirection === "asc"

            ? "sort-asc"

            : "sort-desc";

}




