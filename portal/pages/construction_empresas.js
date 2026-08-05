import { constructorasService }
from "../services/constructorasService.js";

import { empresasService }
from "../services/empresasService.js";

import { geograficaService }
from "../services/geograficaService.js";


import {

    showConfirmModal,
    showFormModal,
    setModalLoading,
    setModalError

}
from "../components/modal.js";


let servicioActivo =
    empresasService;

let tipoEmpresaActivo =
    "mandante";



export async function renderConstructionEmpresas() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Empresas</h1>

            <button
                id="btnNuevaEmpresa"
                class="btn-primary">

                + Nueva Empresa

            </button>

        </div>


        <div class="cubika-tabs">

            <button
                id="tabMandantes"
                class="cubika-tab ${
                tipoEmpresaActivo === "mandante"
                    ? "active"
                    : ""
            }"> Mandantes
            
            </button>
        
            <button
                id="tabConstructoras"
                class="cubika-tab ${
                tipoEmpresaActivo === "constructora"
                    ? "active"
                    : ""
            }"> Constructoras
        
            </button>
        
        </div>


        <div class="table-filters">

            <input
                id="buscarEmpresa"
                class="cubika-input"
                type="text"
                placeholder="Buscar empresa...">

        </div>


        <div id="empresasTable">

            Cargando...

        </div>

    `;


    await cargarEmpresas();


    document
        .getElementById("buscarEmpresa")
        .addEventListener(
            "keyup",
            cargarEmpresas
        );


    document
        .getElementById("btnNuevaEmpresa")
        .addEventListener(
            "click",
            mostrarFormularioNuevaEmpresa
        );


    document
    .getElementById("tabMandantes")
    ?.addEventListener("click", () => {

        servicioActivo =
            empresasService;

        tipoEmpresaActivo =
            "mandante";

        renderConstructionEmpresas();

    });


document
    .getElementById("tabConstructoras")
    ?.addEventListener("click", () => {

        servicioActivo =
            constructorasService;

        tipoEmpresaActivo =
            "constructora";

        renderConstructionEmpresas();

    });

}



async function cargarEmpresas() {

    const table =
        document.getElementById("empresasTable");


    const filtro =
        document
            .getElementById("buscarEmpresa")
            ?.value
            .trim()
            .toUpperCase();


    let empresas =
        await servicioActivo.getAll();


    if (filtro) {

        empresas =
            empresas.filter(empresa =>

                `${empresa.nombre}
                 ${empresa.rut}`
                    .toUpperCase()
                    .includes(filtro)

            );

    }


    let html = `

        <table class="cubika-table">

            <thead>

                <tr>

                    <th>Nombre</th>

                    <th>RUT</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

    `;


    if (!empresas.length) {

        html += `

            <tr>

                <td colspan="4"
                    style="text-align:center;padding:30px;">

                    No existen empresas registradas.

                </td>

            </tr>

        `;

    }


    empresas.forEach(empresa => {

        html += `

            <tr>

                <td>

                    ${empresa.nombre}

                </td>

                <td>

                    ${empresa.rut ?? ""}

                </td>

                <td>

                    <span class="
                        estado-badge
                        ${empresa.estado === "Activo"
                            ? "activo"
                            : "inactivo"}">

                        ${empresa.estado}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-edit"
                        data-id="${empresa.id}">

                        Editar

                    </button>

                    <button
                        class="${empresa.estado === "Activo"
                            ? "btn-danger"
                            : "btn-restore"} btn-toggle-estado"
                        data-id="${empresa.id}">
                    
                        ${empresa.estado === "Activo"
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


    table.innerHTML = html;


    document
        .querySelectorAll(".btn-edit")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => editarEmpresa(btn.dataset.id)
            );

        });


    document
    .querySelectorAll(".btn-toggle-estado")
    .forEach(btn => {

        btn.addEventListener(
            "click",
            () => cambiarEstadoEmpresa(btn.dataset.id)
        );

    });

}


async function mostrarFormularioNuevaEmpresa() {

    showFormModal({

        

    title:

        tipoEmpresaActivo === "mandante"

            ? "Nueva Empresa Mandante"

            : "Nueva Constructora",

        

    content:

        tipoEmpresaActivo === "mandante"

            ? obtenerFormularioMandante() 

            : obtenerFormularioConstructora(),

    submitText: "Guardar",

    

    onSubmit:

        tipoEmpresaActivo === "mandante"

            ? crearEmpresa

            : crearConstructora

});


    await cargarRegionesEmpresa();

    await cargarRegionesRepresentante();


    document
        .getElementById("region")
        .addEventListener(
            "change",
            async e => {

                await cargarComunasEmpresa(
                    e.target.value
                );

            }
        );


    document
        .getElementById(
            "regionRepresentante"
        )
        .addEventListener(
            "change",
            async e => {

                await cargarComunasRepresentante(
                    e.target.value
                );

            }
        );

}



function obtenerFormularioMandante(
    
    empresa = null
){

    return `

        <form id="formEmpresa">

            <div class="empresa-layout">

                <!-- EMPRESA -->

                <div class="empresa-section">

                    <h3>

                        Datos de la Empresa

                    </h3>

                    <div class="form-group">

                        <label>Razón social</label>

                        <input
                            id="nombre"
                            type="text"
                            class="cubika-input"
                            value="${empresa?.nombre ?? ""}"
                            placeholder="Nombre de la empresa..."
                            required>

                    </div>


                    <div class="form-group">

                        <label>RUT</label>

                        <input
                            id="rut"
                            class="cubika-input"
                            type="text"
                            value="${empresa?.rut ?? ""}">

                    </div>
                    
                    

                    <div class="form-group">

                        <label>Email</label>
                    
                        <input
                            id="email"
                            type="email"
                            class="cubika-input"
                            value="${empresa?.email ?? ""}">
                    
                    </div>


                    
                    <div class="form-group">

                        <label>Dirección</label>

                        <input
                            id="direccion"
                            class="cubika-input"
                            type="text"
                            value="${empresa?.direccion ?? ""}">

                    </div>
                    
                    

                <div class="cubika-form-grid">

                    <div class="form-group">

                        <label>Región</label>

                        <select
                            id="region"
                            class="cubika-select">

                            <option value="">
                                Seleccione una región
                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label>Comuna</label>

                        <select
                            id="comuna"
                            class="cubika-select">

                            <option value="">
                                Seleccione una comuna
                            </option>

                        </select>

                    </div>

                </div>

                </div>


                <!-- REPRESENTANTE -->

                <div class="empresa-section">

                    <h3>

                        Datos del Representante Legal

                    </h3>


                    <div class="form-group">

                        <label>Nombre</label>

                        <input
                            id="representante"
                            type="text"
                            class="cubika-input"
                            value="${empresa?.representante_legal ?? ""}"
                            placeholder="Nombre del representante legal..."
                            required>
                            
                    </div>


                    <div class="form-group">

                        <label>RUT</label>

                        <input
                            id="rutRepresentante"
                            type="text"
                            value="${
                                empresa?.rut_representante ?? ""
                            }">

                    </div>


                    <div class="form-group">

                        <label>Dirección</label>

                        <input
                            id="direccionRepresentante"
                            type="text"
                            value="${
                                empresa?.direccion_representante ?? ""
                            }">

                    </div>


                    <div class="cubika-form-grid">


                    <div class="form-group">

                        <label>Región</label>

                        <select
                            id="regionRepresentante"
                            class="cubika-select">

                            <option value="">
                                Seleccione una región
                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label>Comuna</label>

                        <select
                            id="comunaRepresentante"
                            class="cubika-select">

                            <option value="">
                                Seleccione una comuna
                            </option>

                        </select>

                    </div>

                </div>

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


function obtenerFormularioConstructora(
    constructora = null
){

    return `

        <form id="formConstructora">

            <div class="empresa-layout">

                <div class="empresa-section">

                    <h3>

                        Datos de la Constructora

                    </h3>


                    <div class="form-group">

                        <label>Razón Social</label>

                        <input
                            id="nombre"
                            type="text"
                            class="cubika-input"
                            value="${constructora?.nombre ?? ""}"
                            placeholder="Nombre de la constructora..."
                            required>

                    </div>


                    <div class="form-group">

                        <label>RUT</label>

                        <input
                            id="rut"
                            class="cubika-input"
                            type="text"
                            value="${constructora?.rut ?? ""}">

                    </div>


                    <div class="form-group">

                        <label>Email</label>

                        <input
                            id="email"
                            type="email"
                            class="cubika-input"
                            value="${constructora?.email ?? ""}">

                    </div>


                    <div class="form-group">

                        <label>Dirección</label>

                        <input
                            id="direccion"
                            class="cubika-input"
                            type="text"
                            value="${constructora?.direccion ?? ""}">

                    </div>

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



async function crearEmpresa() {

    const nombre =
        document
            .getElementById("nombre")
            .value
            .trim();

    const rut =
        document
            .getElementById("rut")
            .value
            .trim();

    const direccion =
    document
        .getElementById("direccion")
        .value
        .trim();

    const email =
    document
        .getElementById("email")
        .value
        .trim();


    const region_id =
        document
            .getElementById("region")
            .value;
    
    
    const comuna_id =
        document
            .getElementById("comuna")
            .value;
    
    
    const representante_legal =
        document
            .getElementById("representante")
            .value
            .trim();
    
    
    const rut_representante =
        document
            .getElementById("rutRepresentante")
            .value
            .trim();
    
    
    const direccion_representante =
        document
            .getElementById(
                "direccionRepresentante"
            )
            .value
            .trim();
    
    
    const region_representante_id =
        document
            .getElementById(
                "regionRepresentante"
            )
            .value;
    
    
    const comuna_representante_id =
        document
            .getElementById(
                "comunaRepresentante"
            )
            .value;
    

    if (!nombre) {

    setModalError(
        "Debe ingresar el nombre de la empresa."
    );

    document.getElementById("nombre").focus();

    return false;

}

if (!rut) {

    setModalError(
        "Debe ingresar el RUT de la empresa."
    );

    document.getElementById("rut").focus();

    return false;

}

    try {

        setModalLoading(true);
    
        await servicioActivo.create({
    
            nombre,
    
            rut,
    
            direccion,

            email,
    
            region_id: region_id || null,
    
            comuna_id: comuna_id || null,
    
            representante_legal,
    
            rut_representante,
    
            direccion_representante,
    
            region_representante_id:
                region_representante_id || null,
    
            comuna_representante_id:
                comuna_representante_id || null,
    
            estado:"Activo"
    
        });
    
        await cargarEmpresas();
    
        setModalLoading(false);
    
        return true;
    
    }
    catch(error){
    
        console.error(error);
    
        setModalLoading(false);
    
        setModalError(
            "No fue posible guardar la empresa."
        );
    
        return false;
    
    }
    
}



async function editarEmpresa(id) {

    const empresa =
        await servicioActivo.getById(id);

    if (!empresa)
        return;

    showFormModal({

        title:

            tipoEmpresaActivo === "mandante"
        
                ? "Editar Empresa Mandante"
        
                : "Editar Constructora",

        content:

            tipoEmpresaActivo === "mandante"
        
                ? obtenerFormularioMandante(empresa)
        
                : obtenerFormularioConstructora(empresa),

        submitText: "Actualizar",

        size: "large",

        onSubmit: () =>

        tipoEmpresaActivo === "mandante"
    
            ? actualizarEmpresa(id)
    
            : actualizarConstructora(id)

    });
    

    await cargarRegionesEmpresa(
    empresa.region_id
    );
    
    await cargarComunasEmpresa(
    
        empresa.region_id,
    
        empresa.comuna_id
    
    );
    
    
    await cargarRegionesRepresentante(
    
        empresa.region_representante_id
    
    );
    
    await cargarComunasRepresentante(
    
        empresa.region_representante_id,
    
        empresa.comuna_representante_id
    
    );
    

    document
    .getElementById("region")
    .addEventListener(
        "change",
        async e => {

            await cargarComunasEmpresa(
                e.target.value
            );

        }
    );


    document
        .getElementById(
            "regionRepresentante"
        )
        .addEventListener(
            "change",
            async e => {
    
                await cargarComunasRepresentante(
                    e.target.value
                );
    
            }
        );
    
        
    }


async function actualizarEmpresa(id) {

    const nombre =
        document
            .getElementById("nombre")
            .value
            .trim();

    const rut =
        document
            .getElementById("rut")
            .value
            .trim();

    const direccion =
    document
        .getElementById("direccion")
        .value
        .trim();

    const email =
    document
        .getElementById("email")
        .value
        .trim();


    const region_id =
        document
            .getElementById("region")
            .value;
    
    
    const comuna_id =
        document
            .getElementById("comuna")
            .value;
    
    
    const representante_legal =
        document
            .getElementById("representante")
            .value
            .trim();
    
    
    const rut_representante =
        document
            .getElementById("rutRepresentante")
            .value
            .trim();
    
    
    const direccion_representante =
        document
            .getElementById(
                "direccionRepresentante"
            )
            .value
            .trim();
    
    
    const region_representante_id =
        document
            .getElementById(
                "regionRepresentante"
            )
            .value;
    
    
    const comuna_representante_id =
        document
            .getElementById(
                "comunaRepresentante"
            )
            .value;
    


    if (!nombre) {

    setModalError(
        "Debe ingresar el nombre de la empresa."
    );

    document.getElementById("nombre").focus();

    return false;

}

if (!rut) {

    setModalError(
        "Debe ingresar el RUT de la empresa."
    );

    document.getElementById("rut").focus();

    return false;

}

    try {

        setModalLoading(true);

      await servicioActivo.update(

            id,
        
            {
        
                nombre,
        
                rut,
        
                direccion,

                email,
        
                region_id:
                    region_id || null,
        
                comuna_id:
                    comuna_id || null,
        
                representante_legal,
        
                rut_representante,
        
                direccion_representante,
        
                region_representante_id:
                    region_representante_id || null,
        
                comuna_representante_id:
                    comuna_representante_id || null,
        
                estado:"Activo"
        
            }
        
        );

        await cargarEmpresas();

        setModalLoading(false);
        
        return true;

    }

    catch (error) {

        console.error(error);
    
        setModalLoading(false);
    
        setModalError(
            "No fue posible actualizar la empresa."
        );
    
        return false;
    
    }

}


async function cambiarEstadoEmpresa(id) {

    const empresa =
        await servicioActivo.getById(id);

    if (!empresa)
        return;

    const nuevoEstado =
        empresa.estado === "Activo"
            ? "Inactivo"
            : "Activo";

    const accion =
        nuevoEstado === "Activo"
            ? "Activar"
            : "Desactivar";

    showConfirmModal({

        title: `${accion} empresa`,

        message: `

            La empresa
            <strong>${empresa.nombre}</strong>

            será marcada como
            <strong>${nuevoEstado}</strong>.

        `,

        onConfirm: async () => {

            try {

                await servicioActivo.update(id, {

                    estado: nuevoEstado

                });

                await cargarEmpresas();

                return true;

            }

            catch (error) {

                console.error(error);

                return false;

            }

        }

    });

}


async function cargarRegionesEmpresa(
    regionSeleccionada = null
){

    const regiones =
        await geograficaService
            .getRegiones();

    const select =
        document.getElementById(
            "region"
        );

    select.innerHTML = `

        <option value="">
            Seleccione una región
        </option>

    `;

    regiones.forEach(region=>{

        select.innerHTML += `

            <option
                value="${region.id}"
                ${
                    region.id ==
                    regionSeleccionada

                    ? "selected"
                    : ""
                }
            >

                ${region.nombre}

            </option>

        `;

    });

}



async function cargarComunasEmpresa(

    regionId,

    comunaSeleccionada = null

){

    const select =
        document.getElementById(
            "comuna"
        );

    select.innerHTML = `

        <option value="">
            Seleccione una comuna
        </option>

    `;

    if(!regionId)
        return;

    const comunas =
        await geograficaService
            .getComunas(regionId);

    comunas.forEach(comuna=>{

        select.innerHTML += `

            <option
                value="${comuna.id}"

                ${
                    comuna.id ==
                    comunaSeleccionada

                    ? "selected"
                    : ""
                }

            >

                ${comuna.nombre}

            </option>

        `;

    });

}



async function cargarRegionesRepresentante(regionSeleccionada = null){

    const regiones =
        await geograficaService
            .getRegiones();

    const select =
        document.getElementById(
            "regionRepresentante"
        );

    select.innerHTML = `

        <option value="">
            Seleccione una región
        </option>

    `;

    regiones.forEach(region=>{

        select.innerHTML += `

            <option
                value="${region.id}"

                ${
                    region.id ==
                    regionSeleccionada

                    ? "selected"
                    : ""
                }

            >

                ${region.nombre}

            </option>

        `;

    });

}


async function cargarComunasRepresentante(

    regionId,

    comunaSeleccionada = null

){

    const select =
        document.getElementById(
            "comunaRepresentante"
        );

    select.innerHTML = `

        <option value="">
            Seleccione una comuna
        </option>

    `;

    if(!regionId)
        return;

    const comunas =
        await geograficaService
            .getComunas(regionId);

    comunas.forEach(comuna=>{

        select.innerHTML += `

            <option
                value="${comuna.id}"

                ${
                    comuna.id ==
                    comunaSeleccionada

                    ? "selected"
                    : ""
                }

            >

                ${comuna.nombre}

            </option>

        `;

    });

}


async function crearConstructora() {

    const constructora = {

        nombre:
            document
                .getElementById("nombre")
                ?.value
                ?.trim(),

        rut:
            document
                .getElementById("rut")
                ?.value
                ?.trim(),

        email:
            document
                .getElementById("email")
                ?.value
                ?.trim(),

        direccion:
            document
                .getElementById("direccion")
                ?.value
                ?.trim(),

        estado:
            "Activo"

    };


    if (!constructora.nombre) {

        mostrarErrorFormulario(
            "Debe ingresar el nombre de la constructora."
        );

        return;

    }


    try {

        await constructorasService.create(
            constructora
        );

        closeModal();

        await cargarEmpresas();

    }

    catch (error) {

        console.error(error);

        mostrarErrorFormulario(
            error.message
        );

    }

}

async function actualizarConstructora(id) {

    const constructora = {

        nombre:
            document
                .getElementById("nombre")
                ?.value
                ?.trim(),

        rut:
            document
                .getElementById("rut")
                ?.value
                ?.trim(),

        email:
            document
                .getElementById("email")
                ?.value
                ?.trim(),

        direccion:
            document
                .getElementById("direccion")
                ?.value
                ?.trim()

    };


    if (!constructora.nombre) {

        mostrarErrorFormulario(
            "Debe ingresar el nombre de la constructora."
        );

        return;

    }


    try {

        await constructorasService.update(
            id,
            constructora
        );

        closeModal();

        await cargarEmpresas();

    }

    catch (error) {

        console.error(error);

        mostrarErrorFormulario(
            error.message
        );

    }

}




