const form = document.getElementsByTagName("form")[0];
/** @type {HTMLInputElement}  */
const inputCodigo = document.getElementById("codigo");
/** @type {HTMLInputElement}  */
const inputNombre = document.getElementById("nombre");
/** @type {HTMLInputElement}  */
const inputCantidad = document.getElementById("cantidad");
/** @type {HTMLInputElement}  */
const inputPrecio = document.getElementById("precio");
/** @type {HTMLInputElement}  */
const selectCategoria = document.getElementById("categoria");
const tbody = document.getElementsByTagName("tbody")[0];
const cantidadTotalElement = document.getElementById("cantidad-total");
const precioTotalElement = document.getElementById("precio-total");
const granTotalElement = document.getElementById("gran-total");


const preloadedState = {
producto: {},
productos: []
};

let indice = 0;

const reducer = (state, action) => {

    if(action.type == "producto-agregado")
    {
        indice++;
        let producto = action.payload;
        let codigo = indice;
        let total = producto.cantidad * producto.precio;
        return {
            ...state,
            productos: [
                ...state.productos,
                {
                    ...producto,
                    codigo,
                    total
                }
            
            ]
        };
    }

    if (action.type == "producto-modificado")
    {
        const producto = action.payload;
        const productos = state.productos.slice();
        const codigo = producto.codigo;
        const total = producto.cantidad * producto.precio;
        const old = productos.find((item) =>item.codigo ==codigo);
        const index = productos.indexOf(old);
        productos[index] = {...producto, total};
        return {
            ...state,
            productos
        }
    }

    if (action.type == "producto-eliminado")
    {
        const codigo = action.payload.codigo;
        const productos = state.productos.filter((item) => item.codigo != codigo);
       
        return {
            ...state,
            productos
        }
    }

    if (action.type == "producto-seleccionado")
    {
        const codigo = action.payload.codigo;
        
        return {
            ...state,
            producto: state.productos.find(x => x.codigo == codigo) || {}
        }
    }

    return state;
};

const store = Redux.createStore(reducer, preloadedState);

let latestState;


store.subscribe(() =>{
    let currentState = store.getState();
    if(currentState != latestState)
    {
        latestState=currentState;
        console.log("estado: ", store.getState());
        renderForm(currentState.producto);
        renderTable(currentState.productos);
    }
    
});

function renderForm(producto)
{
    inputCodigo.value=producto.codigo || "";
    inputNombre.value=producto.nombre || "";
    inputCantidad.value=producto.cantidad || "";
    inputPrecio.value=producto.precio || "";
    selectCategoria.value=producto.categoria || 1;
}

function renderTable(productos)
{
    const filas = productos.map((item) => {
        const tr = document.createElement("tr");
    
        tr.innerHTML =`
        <td>${item.codigo}</td>
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>${item.precio}</td>
        <td>${item.total}</td>
        <td>
            <div class="btn-group">
                <a title="editar" href="#"  class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil-square"></i>r</a>
                <a title="eliminar" href="#"  class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></a>
            </div>
        </td>
        
        `;

        const [editar, eliminar] = tr.getElementsByTagName("a");

        eliminar.addEventListener("click", (event) => {
            event.preventDefault();
            store.dispatch({
                type: "producto-eliminado",
                payload: {
                    codigo:item.codigo
                }
            })
        });

        editar.addEventListener("click", (event) => {
            event.preventDefault();
            store.dispatch({
                type: "producto-seleccionado",
                payload: {
                    codigo:item.codigo
                }
            })
        });


        return tr;
    });

    tbody.innerHTML = "";
    filas.forEach((tr) => {
        tbody.appendChild(tr);
    });

    const cantidadTotal = productos
    .map(x => x.cantidad)
    .reduce((a,b) => a+b, 0);

    const precioTotal=productos
    .map(x => x.precio)
    .reduce((a,b) => a+b, 0);

    const granTotal = productos
    .map(x => x.total)
    .reduce((a,b) => a+b, 0);

    cantidadTotalElement.innerText = cantidadTotal;
    precioTotalElement.innerText = precioTotal;
    granTotalElement.innerText = granTotal;


}


form.addEventListener("submit", onSubmit);

/**
 * 
 * @param {event} event
 */

function onSubmit(event)
{
    event.preventDefault();

    const data = new FormData(form);
    const values = Array.from(data.entries());

    const [frmCodigo, frmNombre, frmCantidad, frmPrecio, frmCategoria]=values;

    const codigo = parseInt(frmCodigo[1]);
    const nombre = frmNombre[1];
    const cantidad = parseFloat(frmCantidad[1]);
    const precio = parseFloat(frmPrecio[1]);
    const categoria = frmCategoria[1];
   
    if(codigo)
    {
        store.dispatch({

            type: "producto-modificado",
            payload: {
                codigo,
                nombre,
                cantidad,
                precio,
                categoria
            }
            
        });
    }
    else{
        store.dispatch({

            type: "producto-agregado",
            payload: {
                nombre,
                cantidad,
                precio,
                categoria
            }
            
        });

    }

    store.dispatch({
        type: "producto-seleccionado",
        payload: {
            codigo:null
        }
    });

}


store.dispatch({
    type: "producto-agregado",
    payload: {
        nombre: "Prueba a",
        cantidad: 8,
        precio: 5,
        categoria:2
    }
});

store.dispatch({
    type: "producto-agregado",
    payload: {
        nombre: "Prueba b",
        cantidad: 6,
        precio: 20,
        categoria:3
    }
});

store.dispatch({
    type: "producto-modificado",
    payload: {
        codigo: 1,
        nombre: "Prueba 1",
        cantidad: 2,
        precio: 55,
        categoria:2
    }
});

store.dispatch({
    type: "producto-agregado",
    payload: {
        nombre: "Prueba 2",
        cantidad: 12,
        precio: 4,
        categoria:2
    }
});

store.dispatch({
    type: "producto-eliminado",
    payload: {
        codigo: 2
       
    }
});

console.log(store);