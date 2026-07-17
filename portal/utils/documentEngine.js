export function reemplazarVariables(

    plantilla,

    variables

) {

    let contenido =
        plantilla;


    Object.entries(
        variables
    )

    .forEach(

        ([key, value]) => {

            const variable =

                `{{${key}}}`;


            contenido =

                contenido.replaceAll(

                    variable,

                    value ?? ""

                );

        }

    );


    return contenido;

}
