import { geograficaService }
from "../services/geograficaService.js";

import { empresasService }
from "../services/empresasService.js";

import { obrasService }
from "../services/obrasService.js";

import {

    showConfirmModal,
    showFormModal,
    setModalLoading,
    setModalError

}
from "../components/modal.js";


export async function renderConstructionObras() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Obras</h1>

            <button
                id="btnNuevaObra"
                class="btn-primary">

                + Nueva Obra

            </button>

        </div>


        <div class="table-filters">

            <input
                id="buscarObra"
                class="cubika-input"
                type="text"
                placeholder="Buscar obra...">

        </div>


        <div id="obrasTable">

            Cargando...

        </div>

    `;


    await cargarObras();


    document
        .getElementById("buscarObra")
        .addEventListener(
            "keyup",
            cargarObras
        );


    document
        .getElementById("btnNuevaObra")
        .addEventListener(
            "click",
            mostrarFormularioNuevaObra
        );

}



async function cargarObras() {

    const table =
        document.getElementById("obrasTable");


    const filtro =
        document
            .getElementById("buscarObra")
            ?.value
            .trim()
            .toUpperCase();


    let obras =
        await obrasService.getAll();


    if (filtro) {

        obras =
            obras.filter(obra =>

                `${obra.nombre}
                 ${obra.codigo ?? ""}
                 ${obra.comuna?.nombre ?? ""}
                 ${obra.empresa?.nombre ?? ""}`

                    .toUpperCase()

                    .includes(filtro)

            );

    }


    let html = `

        <table class="cubika-table">

            <thead>

                <tr>

                    <th>Nombre</th>

                    <th>Empresa</th>

                    <th>Comúna</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

    `;


    if (!obras.length) {

        html += `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;padding:30px;">

                    No existen obras registradas.

                </td>

            </tr>

        `;

    }


    obras.forEach(obra => {

        html += `

            <tr>

                <td>

                    ${obra.nombre}

                </td>

                <td>

                    ${obra.empresa?.nombre ?? ""}

                </td>

                <td>

                    ${obra.comuna?.nombre ?? ""}

                </td>

                <td>

                    <span class="
                        estado-badge
                        ${obra.estado === "Activa"
                            ? "activo"
                            : "inactivo"}">

                        ${obra.estado}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-edit"
                        data-id="${obra.id}">

                        Editar

                    </button>

                    <button
                        class="${obra.estado === "Activa"
                            ? "btn-danger"
                            : "btn-primary"} btn-toggle-estado"
                        data-id="${obra.id}">

                        ${obra.estado === "Activa"
                            ? "Desactivar"
                            : "Activar"}

                    </button>

                </td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

    `;


    table.innerHTML =
        html;


    document
        .querySelectorAll(".btn-edit")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => editarObra(btn.dataset.id)
            );

        });


    document
        .querySelectorAll(".btn-toggle-estado")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => cambiarEstadoObra(btn.dataset.id)
            );

        });

}


async function mostrarFormularioNuevaObra() {

    showFormModal({

        title: "Nueva Obra",

        content: await obtenerFormularioObra(),

        submitText: "Guardar",

        size: "large",

        onSubmit: crearObra

    });


    await cargarRegiones();


    document
        .getElementById("region_id")
        .addEventListener(
            "change",
            async e => {

                await cargarComunas(
                    e.target.value
                );

            }
        );

}

async function obtenerFormularioObra(obra = null) {

    const empresas =
        await empresasService.getAll();


    const opcionesEmpresas =
        empresas

            .filter(e =>

                e.estado === "Activo"

                ||

                e.id === obra?.empresa_id

            )

            .map(e => `

                <option
                    value="${e.id}"

                    ${obra?.empresa_id === e.id
                        ? "selected"
                        : ""}>

                    ${e.nombre}

                    ${e.estado === "Inactivo"
                        ? " (Inactiva)"
                        : ""}

                </option>

            `)

            .join("");


    return `

        <form id="formObra">

            <div class="form-grid">

                <div class="form-group">

                    <label>Empresa</label>

                    <select
                        id="empresa_id",
                        class="cubika-select"
                        required>

                        <option value="">

                            Seleccione una empresa

                        </option>

                        ${opcionesEmpresas}

                    </select>

                </div>


                <div class="form-group">

                    <label>Nombre</label>

                    <input
                        id="nombre"
                        type="text"
                        value="${obra?.nombre ?? ""}"
                        required>

                </div>

                <div class="form-group">

                    <label>Fecha Inicio</label>

                <input
                    type="date"
                    id="fechaInicio"
                    class="cubika-input"
                    value="${
                        obra?.fecha_inicio ?? ""
                    }">

                    </div>


                <div class="form-group">

                    <label>Fecha Término</label>

                <input
                    type="date"
                    id="fechaTermino"
                    class="cubika-input"
                    value="${
                        obra?.fecha_termino ?? ""
                    }">

                    </div>


                <div class="form-group">

                    <label>Descripción</label>

                    <input
                        id="descripcion"
                        type="text"
                        value="${obra?.descripcion ?? ""}">

                </div>


                <div class="form-group">

                    <label>Dirección</label>

                    <input
                        id="direccion"
                        type="text"
                        value="${obra?.direccion ?? ""}">

                </div>


                <div class="form-group">

                    <label>Región</label>
                
                    <select
                        id="region_id"
                        class="cubika-select">
                
                        <option value="">
                            Seleccione una región
                        </option>
                
                    </select>
                
                </div>
                
                
                <div class="form-group">
                
                    <label>Comuna</label>
                
                    <select
                        id="comuna_id"
                        class="cubika-select">
                
                        <option value="">
                            Seleccione una comuna
                        </option>
                
                    </select>
                
                </div>

            </div>


            <div
                id="modalFormError"
                class="form-error"
                style="display:none;">
            </div>

        </form>

    `;

}


async function crearObra() {

    const empresa_id =
        document
            .getElementById("empresa_id")
            .value;

    const nombre =
        document
            .getElementById("nombre")
            .value
            .trim();

    const codigo =
        document
            .getElementById("codigo")
            .value
            .trim();

    const direccion =
        document
            .getElementById("direccion")
            .value
            .trim();

    const descripcion =
    document
        .getElementById(
            "descripcion"
        )
        .value
        .trim();

    const fecha_inicio =
        document
            .getElementById(
                "fechaInicio"
            )
            .value || null;
    
    const fecha_termino =
        document
            .getElementById(
                "fechaTermino"
            )
            .value || null;
            
   const region_id =
    document
        .getElementById("region_id")
        .value;
    
    const comuna_id =
    document
        .getElementById("comuna_id")
        .value;


    // =========================
    // VALIDACIONES
    // =========================


    if (!region_id) {

    setModalError(
        "Debe seleccionar una región."
    );

    return false;

        }
        
        if (!comuna_id) {
        
            setModalError(
                "Debe seleccionar una comuna."
            );
        
            return false;
        
        }    

    if (!empresa_id) {

        setModalError(
            "Debe seleccionar una empresa."
        );

        return false;

    }

    if (!nombre) {

        setModalError(
            "Debe ingresar el nombre de la obra."
        );

        return false;

    }


    try {

        setModalLoading(true);

           await obrasService.create({

                empresa_id,
            
                nombre,
            
                codigo,
            
                direccion,

               descripcion,
                
               fecha_inicio,
                
               fecha_termino,
            
                region_id,
            
                comuna_id,
            
                estado: "Activa"
            
            });

        await cargarObras();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible guardar la obra."
        );

        return false;

    }

}


async function editarObra(id) {

    const obra =
        await obrasService.getById(id);

    if (!obra)
        return;

    showFormModal({

        title: "Editar Obra",

        content:
            await obtenerFormularioObra(obra),

        submitText: "Actualizar",

        onSubmit: () =>
            actualizarObra(id)

    });


    await cargarRegiones(obra.region_id);

await cargarComunas(
    obra.region_id,
    obra.comuna_id
);


document
    .getElementById("region_id")
    .addEventListener(
        "change",
        async e => {

            await cargarComunas(
                e.target.value
            );

        }
    );

}


async function actualizarObra(id) {

    const empresa_id =
        document
            .getElementById("empresa_id")
            .value;

    const nombre =
        document
            .getElementById("nombre")
            .value
            .trim();

    const codigo =
        document
            .getElementById("codigo")
            .value
            .trim();

    const direccion =
        document
            .getElementById("direccion")
            .value
            .trim();

    const descripcion =
        document
            .getElementById(
                "descripcion"
            )
            .value
            .trim();
    
    const fecha_inicio =
        document
            .getElementById(
                "fechaInicio"
            )
            .value || null;
    
    const fecha_termino =
        document
            .getElementById(
                "fechaTermino"
            )
            .value || null;
        

   const region_id =
    document
        .getElementById("region_id")
        .value;

    const comuna_id =
    document
        .getElementById("comuna_id")
        .value;


        if (!region_id) {
    
        setModalError(
            "Debe seleccionar una región."
        );
    
        return false;
    
    }
    
    if (!comuna_id) {
    
        setModalError(
            "Debe seleccionar una comuna."
        );
    
        return false;
    
    }
    

    if (!empresa_id) {

        setModalError(
            "Debe seleccionar una empresa."
        );

        return false;

    }

    if (!nombre) {

        setModalError(
            "Debe ingresar el nombre de la obra."
        );

        return false;

    }


    try {

        setModalLoading(true);

        await obrasService.update(id, {

            empresa_id,
        
            nombre,
        
            codigo,
        
            direccion,

            descripcion,
            
            fecha_inicio,
            
            fecha_termino,
        
            region_id,
        
            comuna_id,
        
            updated_at:
                new Date().toISOString()
        
        });

        await cargarObras();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible actualizar la obra."
        );

        return false;

    }

}


async function cambiarEstadoObra(id) {

    const obra =
        await obrasService.getById(id);

    if (!obra)
        return;

    const nuevoEstado =
        obra.estado === "Activa"
            ? "Inactiva"
            : "Activa";


    showConfirmModal({

        title:

            nuevoEstado === "Activa"

                ? "Activar obra"

                : "Desactivar obra",

        message: `

            La obra

            <strong>

                ${obra.nombre}

            </strong>

            será

            <strong>

                ${nuevoEstado.toLowerCase()}

            </strong>.

            <br><br>

            Podrá cambiar su estado nuevamente cuando lo desee.

        `,

        onConfirm: async () => {

            try {

                await obrasService.update(id, {

                    estado: nuevoEstado,

                    updated_at:
                        new Date().toISOString()

                });

                await cargarObras();

            }

            catch (error) {

                console.error(error);

                return false;

            }

        }

    });

}


async function cargarRegiones(regionSeleccionada = null) {

    const regiones =
        await geograficaService.getRegiones();

    const select =
        document.getElementById("region_id");

    select.innerHTML = `

        <option value="">
            Seleccione una región
        </option>

    `;

    regiones.forEach(region => {

        select.innerHTML += `

            <option
                value="${region.id}"
                ${region.id == regionSeleccionada
                    ? "selected"
                    : ""}>

                ${region.nombre}

            </option>

        `;

    });

}


async function cargarComunas(regionId, comunaSeleccionada = null) {

    const select =
        document.getElementById("comuna_id");

    select.innerHTML = `

        <option value="">
            Seleccione una comuna
        </option>

    `;

    if (!regionId)
        return;

    const comunas =
        await geograficaService.getComunas(regionId);

    comunas.forEach(comuna => {

        select.innerHTML += `

            <option
                value="${comuna.id}"
                ${comuna.id == comunaSeleccionada
                    ? "selected"
                    : ""}>

                ${comuna.nombre}

            </option>

        `;

    });

}

