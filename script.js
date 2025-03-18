document.addEventListener("DOMContentLoaded", function () {
    const inputsMoneda = document.querySelectorAll(".input-moneda");

    inputsMoneda.forEach(input => {
        input.addEventListener("input", function () {
            this.value = formatearNumero(this.value);
        });
    });
});

// Función para formatear números con puntos mientras se escribe
function formatearNumero(valor) {
    return valor.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Función para formatear moneda sin agregar doble "$"
function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    }).format(valor).replace("COP", "").trim();
}

function calcularSueldo() {
    let salario = document.getElementById("salario").value.replace(/\./g, "");
    let auxilio = parseFloat(document.getElementById("auxilioTransporte").value) || 0;
    let horaInicio = document.getElementById("horaInicio").value;
    let horaFin = document.getElementById("horaFin").value;

    if (!salario || !horaInicio || !horaFin) {
        mostrarError("Por favor completa todos los campos.");
        return;
    }

    salario = parseFloat(salario) || 0;
    let inicio = convertirAHoras(horaInicio);
    let fin = convertirAHoras(horaFin);
    if (fin < inicio) fin += 24;

    let horasTrabajadas = fin - inicio;
    let horasExtras = horasTrabajadas > 8 ? horasTrabajadas - 8 : 0;
    let horasNormales = horasTrabajadas - horasExtras;

    let valorHora = salario / 240;
    let valorHoraExtra = valorHora * 1.25;

    let horasNocturnas = 0;
    for (let h = inicio; h < fin; h++) {
        if (h >= 21 || h < 6) horasNocturnas++;
    }

    let recargoNocturno = horasNocturnas * (valorHora * 0.35);
    let totalHorasExtras = horasExtras * valorHoraExtra;
    let salud = salario * 0.04;
    let pension = salario * 0.04;
    let sueldoNeto = salario - salud - pension + auxilio + totalHorasExtras + recargoNocturno;

    document.getElementById("desprendible").innerHTML = `
        <strong>Salario Base:</strong> <span class="valor-positivo">${formatoMoneda(salario)}</span><br>
        <strong>Auxilio de Transporte:</strong> <span class="valor-positivo">${formatoMoneda(auxilio)}</span><br>
        <strong>Horas Normales:</strong> ${horasNormales}h <span class="valor-positivo">${formatoMoneda(horasNormales * valorHora)}</span><br>
        <strong>Horas Extras:</strong> ${horasExtras}h <span class="valor-positivo">${formatoMoneda(totalHorasExtras)}</span><br>
        <strong>Recargo Nocturno:</strong> ${horasNocturnas}h <span class="valor-positivo">${formatoMoneda(recargoNocturno)}</span><br>
        <strong>Descuento Salud:</strong> <span class="valor-negativo">-${formatoMoneda(salud)}</span><br>
        <strong>Descuento Pensión:</strong> <span class="valor-negativo">-${formatoMoneda(pension)}</span><br>
        <hr>
        <strong class="total-pagar">Total a Pagar: ${formatoMoneda(sueldoNeto)}</strong>
    `;
}

function convertirAHoras(hora) {
    let [horas, minutos] = hora.split(":").map(Number);
    return horas + minutos / 60;
}

function mostrarError(mensaje) {
    let errorDiv = document.getElementById("error-message");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = "error-message";
        errorDiv.style.color = "red";
        errorDiv.style.marginTop = "10px";
        document.querySelector(".container").prepend(errorDiv);
    }
    errorDiv.textContent = mensaje;
}

function calcularVacaciones() {
    let salarioBase = parseFloat(document.getElementById("salarioBase").value.replace(/\./g, "")) || 0;
    let fechaInicio = document.getElementById("fechaInicio").value;
    let fechaFin = document.getElementById("fechaFin").value;

    if (!fechaInicio || !fechaFin) {
        alert("Por favor selecciona ambas fechas.");
        return;
    }

    let inicio = new Date(fechaInicio);
    let fin = new Date(fechaFin);

    // Calcular días trabajados basados en 360 días laborales por año
    let diferenciaDias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
    let diasTrabajados = (diferenciaDias / 365) * 360;

    if (diasTrabajados <= 0 || diasTrabajados > 360) {
        alert("Ingrese un rango de fechas válido.");
        return;
    }

    let salarioDiario = salarioBase / 30;
    let vacacionesPendientes = (diasTrabajados / 360) * 15;
    let pagoVacaciones = vacacionesPendientes * salarioDiario;

    document.getElementById("resultadoVacaciones").innerHTML = `
        <strong>Días trabajados:</strong> ${Math.round(diasTrabajados)} días<br>
        <strong>Días de Vacaciones:</strong> ${vacacionesPendientes.toFixed(2)} días<br>
        <strong>Pago de Vacaciones:</strong> <span class="valor-positivo">${formatoMoneda(pagoVacaciones)}</span>
    `;
}

function calcularPrima() {
    let salario = parseFloat(document.getElementById("salarioPrima").value.replace(/\./g, "")) || 0;
    let auxilio = parseFloat(document.getElementById("auxilioPrima").value) || 0;
    let fechaInicio = document.getElementById("fechaInicio").value;
    let fechaFinal = document.getElementById("fechaFinal").value;

    if (!fechaInicio || !fechaFinal) {
        alert("Por favor selecciona la fecha de inicio y la fecha final.");
        return;
    }

    let inicio = new Date(fechaInicio);
    let fin = new Date(fechaFinal);
    let diferenciaDias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));

    if (diferenciaDias <= 0 || diferenciaDias > 180) {
        alert("El período debe ser válido y no mayor a 180 días.");
        return;
    }

    let salarioBaseTotal = salario + auxilio;
    let prima = (salarioBaseTotal / 360) * diferenciaDias;

    document.getElementById("resultadoPrima").innerHTML = `
        <strong>Días Trabajados:</strong> ${diferenciaDias} días<br>
        <strong>Valor de la Prima:</strong> <span class="valor-positivo">${formatoMoneda(prima)}</span>
    `;
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("liquidacion-form");
    const resultadoDiv = document.getElementById("resultado");
    const tipoContrato = document.getElementById("tipoContrato");
    const duracionContrato = document.getElementById("duracionContrato");

    tipoContrato.addEventListener("change", function () {
        duracionContrato.style.display = tipoContrato.value === "fijo" ? "block" : "none";
    });

    // Formateo de los campos de sueldo y otros números
    const inputsMoneda = document.querySelectorAll(".input-moneda");
    inputsMoneda.forEach(input => {
        input.addEventListener("input", function () {
            this.value = formatearNumero(this.value);
        });
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Obtener valores del formulario y eliminar los puntos antes de convertirlo a número
        const sueldo = parseFloat(document.getElementById("sueldo").value.replace(/\./g, ""));
        const despido = document.getElementById("despido").value;
        const contrato = tipoContrato.value;
        const fechaIngreso = new Date(document.getElementById("fechaIngreso").value);
        const fechaRetiro = new Date(document.getElementById("fechaRetiro").value);
        const auxilioTransporte = document.getElementById("auxilioTransporte").value === "si";
        const diasVacaciones = parseInt(document.getElementById("diasVacaciones").value) || 0;
        const calculoTiempo = document.getElementById("calculoTiempo").value;

        // Calcular días trabajados
        const tiempoTrabajadoMS = fechaRetiro - fechaIngreso;
        const diasTrabajados = tiempoTrabajadoMS / (1000 * 60 * 60 * 24);
        const aniosTrabajados = Math.floor(diasTrabajados / 365);
        const mesesTrabajados = Math.floor((diasTrabajados % 365) / 30);

        // Ajustar si solo se quiere calcular el año/semestre en curso
        let diasBase = diasTrabajados;
        if (calculoTiempo === "actual") {
            const inicioAñoActual = new Date(fechaRetiro.getFullYear(), 0, 1); // 1 de enero del año actual
            const inicioSemestreActual = fechaRetiro.getMonth() >= 6
                ? new Date(fechaRetiro.getFullYear(), 6, 1)  // 1 de julio si está en el segundo semestre
                : inicioAñoActual;  // 1 de enero si está en el primer semestre

            diasBase = (fechaRetiro - inicioSemestreActual) / (1000 * 60 * 60 * 24);
        }

        // Auxilio de transporte (2024 en Colombia: $140.606 si gana hasta 2 SMMLV)
        const auxilioValor = auxilioTransporte ? 140606 : 0;
        const auxilioMensual = auxilioValor * mesesTrabajados;

        // Indemnización
        let indemnizacion = 0;
        if (despido === "si") {
            if (contrato === "indefinido") {
                indemnizacion = sueldo + ((aniosTrabajados - 1) * (sueldo / 30) * 20);
            } else if (contrato === "fijo") {
                const duracion = parseInt(document.getElementById("duracion").value) || 1;
                indemnizacion = sueldo * (duracion - mesesTrabajados);
            } else if (contrato === "obra") {
                indemnizacion = sueldo * mesesTrabajados;
            }
        }

        // Vacaciones no tomadas
        const valorDiaSueldo = sueldo / 30;
        const vacacionesPendientes = valorDiaSueldo * diasVacaciones;

        // Cesantías y prima de servicios (según cálculo del año/semestre en curso o total)
        const cesantias = ((sueldo + auxilioValor) * diasBase) / 360;
        const interesesCesantias = (cesantias * diasBase * 0.12) / 360;
        const primaServicios = ((sueldo + auxilioValor) * diasBase) / 360;

        // Total
        const totalLiquidacion = indemnizacion + vacacionesPendientes + cesantias + interesesCesantias + primaServicios + auxilioMensual;

        resultadoDiv.innerHTML = `
            <h2>Resultado de Liquidación</h2>
            <p><strong>Tiempo trabajado:</strong> ${aniosTrabajados} años, ${mesesTrabajados} meses</p>
            <p><strong>Indemnización:</strong> $${indemnizacion.toLocaleString()}</p>
            <p><strong>Vacaciones no tomadas:</strong> $${vacacionesPendientes.toLocaleString()}</p>
            <p><strong>Cesantías:</strong> $${cesantias.toLocaleString()}</p>
            <p><strong>Intereses sobre cesantías:</strong> $${interesesCesantias.toLocaleString()}</p>
            <p><strong>Prima de servicios:</strong> $${primaServicios.toLocaleString()}</p>
            <p><strong>Auxilio de transporte total:</strong> $${auxilioMensual.toLocaleString()}</p>
            <h3><strong>Total a pagar:</strong> $${totalLiquidacion.toLocaleString()}</h3>
        `;
    });
});

// Función para formatear números con puntos mientras se escribe
function formatearNumero(valor) {
    return valor.replace(/\D/g, "")  // Eliminamos cualquier caracter no numérico
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".");  // Añadimos puntos para separar los miles
}
