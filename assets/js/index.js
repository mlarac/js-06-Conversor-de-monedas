let chart;

document.getElementById('formMoneda').addEventListener('submit', async function(event) {
  event.preventDefault(); // Evita el comportamiento por defecto del formulario

  const montoCLP = document.getElementById('ingreso').value;
  const monedaSeleccionada = document.getElementById('monedas').value;

  if (monedaSeleccionada === 'dolar' || monedaSeleccionada === 'euro') {
    try {
      const datos = await getConversion(monedaSeleccionada, montoCLP);
      mostrarCambio(montoCLP, monedaSeleccionada, datos);
      renderGrafica(datos);
    } catch (error) {
      alert('Hubo un error al obtener los datos de conversión. Por favor, inténtelo de nuevo más tarde.');
      console.error(error);
    }
  } else {
    alert('Seleccione una moneda válida para la conversión.');
  }
});

async function getConversion(moneda, montoCLP) {
  let apiUrl;
  if (moneda === 'dolar') {
    apiUrl = "https://mindicador.cl/api/dolar";
  } else if (moneda === 'euro') {
    apiUrl = "https://mindicador.cl/api/euro";
  }

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    const labels = data.serie.map(item => new Date(item.fecha).toLocaleDateString());
    const valores = data.serie.map(item => item.valor);
    const valoresConvertidos = valores.map(valor => montoCLP / valor);

    const datasets = [
      {
        label: `Conversión a ${moneda.toUpperCase()}`,
        borderColor: moneda === 'dolar' ? "rgb(75, 192, 192)" : "rgb(54, 162, 235)",
        data: valoresConvertidos,
      },
    ];

    return { labels, datasets, valorActual: valores[0], montoConvertido: valoresConvertidos[0] };
  } catch (error) {
    throw new Error('Error al obtener los datos de la API');
  }
}

function mostrarCambio(montoCLP, moneda, datos) {
  const cambio = document.getElementById('cambio');
  cambio.innerHTML = `Monto ingresado: ${montoCLP} CLP <br> 
                      Valor del ${moneda}: ${datos.valorActual} <br> 
                      Monto convertido: ${datos.montoConvertido.toFixed(2)} ${moneda.toUpperCase()}`;
}

function renderGrafica(data) {
  const ctx = document.getElementById("myChart").getContext("2d");

  if (chart) {
    chart.destroy(); // Destruye el gráfico anterior si existe
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: data.datasets,
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}