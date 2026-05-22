(() => {
    'use strict'

    let saldo = 0;
    const gastos = [];

    class Gasto {
        constructor(descripcion, monto, cubierto, recurrente) {
            this.id = crypto.randomUUID();
            this.descripcion = descripcion;
            this.monto = monto;
            this.cubierto = cubierto;
            this.pagado = cubierto;
            this.recurrente = recurrente;
        }
    }

    const spanSaldoActual = document.querySelector('#saldo-actual');
    const spanSaldoDisponible = document.querySelector('#saldo-disponible');

    const botonAgregarGasto = document.querySelector('#agregar-gasto');
    const listaGastos = document.querySelector('#lista-gastos');
    const modalAgregarGasto = document.querySelector('#modal-gasto');
    const contenidoAgregarGasto = document.querySelector('#modal-gasto .modal-contenido');
    const botonCerrarGasto = document.querySelector('#cerrar-gasto');
    const botonGuardarGasto = document.querySelector('#guardar-gasto');
    const formGasto = document.querySelector('#form-gasto');

    const botonCambiarSaldo = document.querySelector('#cambiar-saldo');
    const modalAgregarSaldo = document.querySelector('#modal-saldo');
    const contenidoAgregarSaldo = document.querySelector('#modal-saldo .modal-contenido');
    const botonCerrarSaldo = document.querySelector('#cerrar-saldo');
    const botonAgregarSaldo = document.querySelector('#agregar-saldo');
    const botonActualizarSaldo = document.querySelector('#actualizar-saldo');
    const formSaldo = document.querySelector('#form-saldo');

    const botonReiniciarGastos = document.querySelector('#reiniciar-gastos');

    const inicializar = () => {
        const fragmento = document.createDocumentFragment();

        cargarDatos();

        listaGastos.innerHTML = '';

        for (const gasto of gastos) {
            fragmento.append(mostrarGasto(gasto));
        }

        listaGastos.append(fragmento);

        calcularSaldo();
    }

    const crearGasto = (descripcion, monto, cubierto, recurrente) => {
        const nuevoGasto = new Gasto(descripcion, monto, cubierto, recurrente);
        gastos.push(nuevoGasto);
        guardarDatos();
        inicializar();
        return nuevoGasto;
    }

    const mostrarGasto = (gasto) => {
        const div_gasto = document.createElement('div');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        const monto = document.createElement('span');
        const botonModificar = document.createElement('button');
        const botonEliminar = document.createElement('button');
        const pencil = document.createElement('span');
        const trash = document.createElement('span');

        div_gasto.classList.add('div-gasto');

        checkbox.type = 'checkbox';
        checkbox.checked = gasto.cubierto || gasto.pagado;
        checkbox.addEventListener('change', (e) => {
            if (gasto.cubierto) {
                checkbox.checked = true;
                return;
            }

            gasto.pagado = e.target.checked;
            guardarDatos();
            calcularSaldo();
        });

        label.append(checkbox);
        label.append(gasto.descripcion);

        monto.textContent = Number.parseFloat(gasto.monto).toFixed(2);

        pencil.classList.add('fa', 'fa-pencil');
        trash.classList.add('fa', 'fa-trash');

        botonModificar.append(pencil);
        botonModificar.classList.add('modificar-gasto');
        botonModificar.addEventListener('click', () => abrirGasto(gasto));

        botonEliminar.append(trash);
        botonEliminar.classList.add('eliminar-gasto');
        botonEliminar.addEventListener('click', () => eliminarGastos(gasto.id));

        div_gasto.append(label);
        div_gasto.append(monto);
        div_gasto.append(botonModificar);
        div_gasto.append(botonEliminar);

        return div_gasto;
    }

    const abrirGasto = (gasto) => {
        if (gasto) {
            formGasto['gasto-id'].value = gasto.id;
            formGasto['gasto-nombre'].value = gasto.descripcion;
            formGasto['gasto-monto'].value = gasto.monto;
            formGasto['gasto-cubierto'].checked = gasto.cubierto;
            formGasto['gasto-recurrente'].checked = gasto.recurrente;
        }

        modalAgregarGasto.classList.remove('close');
        modalAgregarGasto.classList.add('open');
    }

    const cerrarGasto = () => {
        modalAgregarGasto.classList.add('close');
    }

    const abrirSaldo = () => {
        modalAgregarSaldo.classList.remove('close');
        modalAgregarSaldo.classList.add('open');
    }

    const cerrarSaldo = () => {
        modalAgregarSaldo.classList.add('close');
    }

    const guardarGasto = () => {
        const id = formGasto['gasto-id'].value;
        const descripcion = formGasto['gasto-nombre'].value;
        const monto = formGasto['gasto-monto'].value;
        const cubierto = formGasto['gasto-cubierto'].checked;
        const recurrente = formGasto['gasto-recurrente'].checked;
        if (descripcion && monto) {
            if (id) {
                const indice = gastos.findIndex(e => e.id === id);
                const gastoModificado = gastos[indice];
                gastoModificado.descripcion = descripcion;
                gastoModificado.monto = monto;
                gastoModificado.cubierto = cubierto;
                gastoModificado.recurrente = recurrente;
                gastos[indice] = gastoModificado;

                guardarDatos();
                inicializar();
            } else {
                crearGasto(descripcion.toUpperCase(), parseFloat(monto), cubierto, recurrente);
            }
            cerrarGasto();
        }
    }

    const guardarSaldo = (actualizar) => {
        const saldoNuevo = parseFloat(formSaldo.querySelector('input').value);

        if (!isNaN(saldoNuevo) && saldoNuevo >= 0) {
            saldo = actualizar ? saldoNuevo : saldo + saldoNuevo;

            cerrarSaldo();
            guardarDatos();
            calcularSaldo();
        }
    }

    const calcularSaldo = () => {
        let saldoDisponible = saldo;

        for (const gasto of gastos) {
            if (!gasto.cubierto && gasto.pagado) {
                saldoDisponible -= gasto.monto;
            }
        }

        spanSaldoActual.textContent = saldo.toFixed(2);
        spanSaldoDisponible.textContent = saldoDisponible.toFixed(2);
    }

    const eliminarGastos = (id) => {
        if (!id) {
            for (let gasto of gastos) {
                gasto.cubierto = false;
                gasto.pagado = false;
            }

            saldo = parseFloat(spanSaldoDisponible.textContent);
        }

        gastos.splice(0, gastos.length,
            ...gastos.filter(e => id ? e.id !== id : e.recurrente));
        guardarDatos();
        inicializar();
    }

    const cargarDatos = () => {
        gastos.length = 0;

        const datosGastos = localStorage.getItem('gastos');
        const saldoGuardado = localStorage.getItem('saldo');

        if (datosGastos) {
            gastos.push(...JSON.parse(datosGastos || '[]'));
        }
        if (saldoGuardado) {
            saldo = JSON.parse(saldoGuardado);
        }
    }

    const guardarDatos = () => {
        localStorage.setItem('gastos', JSON.stringify(gastos));
        localStorage.setItem('saldo', JSON.stringify(saldo));
    }

    botonAgregarGasto.addEventListener('click', () => abrirGasto());
    botonCerrarGasto.addEventListener('click', () => cerrarGasto());
    contenidoAgregarGasto.addEventListener('animationend', () => {
        if (modalAgregarGasto.classList.contains('close')) {
            modalAgregarGasto.classList.remove('open', 'close');
            formGasto['gasto-id'].value = '';
            formGasto.reset();
        }
    });
    botonGuardarGasto.addEventListener('click', () => guardarGasto());

    botonCambiarSaldo.addEventListener('click', () => abrirSaldo());
    botonCerrarSaldo.addEventListener('click', () => cerrarSaldo());
    contenidoAgregarSaldo.addEventListener('animationend', () => {
        if (modalAgregarSaldo.classList.contains('close')) {
            modalAgregarSaldo.classList.remove('open', 'close');
            formSaldo.reset();
        }
    });
    botonAgregarSaldo.addEventListener('click', () => guardarSaldo());
    botonActualizarSaldo.addEventListener('click', () => guardarSaldo(true));

    botonReiniciarGastos.addEventListener('click', () => eliminarGastos());

    inicializar();
})();
