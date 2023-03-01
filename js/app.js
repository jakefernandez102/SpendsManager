//variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');
const divRestante = document.querySelector('.restante');


//eventos
evetListeners();
function evetListeners() {
    document.addEventListener('DOMContentLoaded', function () {

        //Pregunta el presupuesto al cargar la pagina
        preguntarPresupuesto();

        //Formulario
        formulario.addEventListener('submit', agregarGasto);

    });
}



//Clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = parseFloat(presupuesto);
        this.restante = parseFloat(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.disminuirRestante();
    }

    disminuirRestante(presupuesto) {
        
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        if(gastado > this.restante){
            ui.imprimirAlerta('Los gastos son MAYORES al restante.','error');
            return;
        }
        this.restante = this.presupuesto - gastado;
    }

    eliminaGasto(id){
      this.gastos =  this.gastos.filter(gasto => gasto.id != id);
      this.disminuirRestante();
        
    }

}

class UI {
    insertarPresupuesto(cantidad) {
        //Se extrae el valor
        const { presupuesto, restante } = cantidad;

        //se agrega al HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo) {

        const divAlerta = document.createElement('DIV');
        divAlerta.classList.add('text-center', 'alert');

        if (tipo === 'error') {
            divAlerta.classList.add('alert-danger')
        } else if (tipo === 'correcto') {
            divAlerta.classList.add('alert-success')
        }

        //mensaje de error
        divAlerta.textContent = mensaje;

        //insertar en el html

        document.querySelector('.primario').insertBefore(divAlerta, formulario);

        //Quitar error
        setTimeout(() => {
            divAlerta.remove();
        }, 3000);
    }

    mostrarGastos(gastos) {
        //limpiar el HTML
        limpiarHTML();

        //Iterar sobre los gastos
        gastos.forEach(gasto => {

            //distructuring de gastos
            const { nombre, cantidad, id } = gasto;

            //Traer ul, li 
            const ul = document.querySelector('.list-group');
            const li = document.createElement('LI');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            // li.setAttribute('data-id',id); otra manera de agregar un atributo
            li.dataset.id = id;

            //Asigna valores inyexta el HTML
            li.innerHTML = `
                        ${nombre}: <span class="badge badge-primary badge-pill">$ ${cantidad} </span>
            `;
            //boton Eliminar
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times;';
            btnBorrar.onclick = () => {
                //eliminar gasto
                eliminarGasto(id);
            };
            li.appendChild(btnBorrar);

            ul.appendChild(li);
        });
    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;

    }

    comprobarPresupuesto(presupuestoObj){
        const {presupuesto, restante} = presupuestoObj;

        //comprobar 25%
        if( (presupuesto / 4) > restante ){
            divRestante.classList.remove('alert-success','alert-danger');
            divRestante.classList.add('alert-danger');
        }else if( (presupuesto / 2 ) > restante){
            divRestante.classList.remove('alert-success','alert-danger');
            divRestante.classList.add('alert-warning');
        }else{
            divRestante.classList.remove('alert-danger','alert-warning');
            divRestante.classList.add('alert-success');
        }

        //SI el total es 0 o menos
        if(restante <= 0){
            ui.imprimirAlerta('El presupuesto se ha agostado', 'error');

            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }
}

//Inicializar objetos
const ui = new UI();
let presupuesto;

// Funciones

//Limpiar HTML
function limpiarHTML() {
    const listado = document.querySelector('.list-group');
    while (listado.firstChild) {
        listado.removeChild(listado.firstChild);
    }
}

function preguntarPresupuesto() {
    const presupuestoUsuario = parseFloat(prompt('Cual es tu presupuesto?'));


    if (presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        window.location.reload();
    }


    //Presupuesto valido
    presupuesto = new Presupuesto(presupuestoUsuario);


    //insertar el presupuesto en pantalla
    ui.insertarPresupuesto(presupuesto);
}

//Añade gastos
function agregarGasto(e) {
    e.preventDefault();

    //leer datos formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = parseFloat(document.querySelector('#cantidad').value);
    
    //Validar
    if (nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('La cantidad debe de ser una cantidad valida', 'error');
        return;
    }else if(cantidad > presupuesto.restante){
        ui.imprimirAlerta('Los gastos son MAYORES al restante.','error');
        return;
    }


    //Generando el objeto de tipo gasto
    // const  { nombre, cantidad } = gasto ; //ESTO EXTRAE LOS VALORES DE GASTOS
    const gasto = { nombre, cantidad, id: Date.now() }; //ESTO INSETA LOS VALORES A GASTOS

    //Añade nuevo gasto
    presupuesto.nuevoGasto(gasto);

    //resetar formulario
    formulario.reset();

    //Agregar Gastos al HTML
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos)

    //Actualiza el restante del presupuesto
    ui.actualizarRestante(restante);

    //Comprueba el presupuesto
    ui.comprobarPresupuesto(presupuesto);

    //Mensaje de exito
    ui.imprimirAlerta('Gasto agregado', 'correcto');
}

function eliminarGasto(id){
    //Elimina del arreglo o del objeto
    presupuesto.eliminaGasto(id);

    //Elimina de HTML
    const {gastos,restante} = presupuesto;
    ui.mostrarGastos(gastos);

     //Actualiza el restante del presupuesto
     ui.actualizarRestante(restante);

     //Comprueba el presupuesto
     ui.comprobarPresupuesto(presupuesto);
    
}