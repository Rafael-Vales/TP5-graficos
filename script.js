const urls = [
    "https://apidemo.geoeducacion.com.ar/api/testing/control/1",
    "https://apidemo.geoeducacion.com.ar/api/testing/control/2",
    "https://apidemo.geoeducacion.com.ar/api/testing/control/3",
    "https://apidemo.geoeducacion.com.ar/api/testing/control/4",
    "https://apidemo.geoeducacion.com.ar/api/testing/control/5"
];

window.onload=function(){
    
};

function cargarDatos() {
    const select = document.getElementById('caso');
    const casoSeleccionado = parseInt(select.value);
    cargarDatosYGraficar(casoSeleccionado);
}

function cargarDatosYGraficar(casoSeleccionado) {
    const url = urls[casoSeleccionado - 1];

    const container = document.getElementById('graficos');
    container.innerHTML = '';

    fetch(url)
        .then(res => res.json())
        .then(json => {
            if (json.success && Array.isArray(json.data)) {
                const experimento = json.data[0];  // tomamos el primer objeto
                const datos = experimento.valores.map(p => p.y);
                const media = experimento.media;
                const lsc = experimento.lsc;
                const lic = experimento.lic;

                graficarControlChart(datos, casoSeleccionado, media, lsc, lic);
            } else {
                console.error("Respuesta inesperada:", json);
                document.getElementById("alerta").innerText = `Error al cargar datos del caso ${casoSeleccionado}`;
            }
        })
        .catch(err => {
            console.error("Error al cargar datos:", err);
            document.getElementById("alerta").innerText = `Error de red: no se pudo acceder a la API del caso ${casoSeleccionado}`;
        });
}

function graficarControlChart(datos, idGrafico, media, lsc, lic) {
    const container = document.getElementById('graficos');
    const canvas = document.createElement('canvas'); 
    canvas.id = `grafico${idGrafico}`;
    container.appendChild(canvas);

    
const fueraDeControl = datos.filter(v => v > lsc || v < lic).length;

const alertaDiv = document.getElementById('alerta');
if (fueraDeControl > 0) {
    alertaDiv.style.color = "red";
    alertaDiv.innerText = `Se detectaron ${fueraDeControl} puntos fuera de control.`;
} else {
    alertaDiv.style.color = "green";
    alertaDiv.innerText = "Todos los puntos están dentro de los límites.";
}

    const coloresPuntos = datos.map(v => (v > lsc || v < lic) ? 'red' : 'blue');

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: datos.map((_, i) => i + 1),
            datasets: [
                {
                    label: "Valores",
                    data: datos,
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: false,
                    pointBackgroundColor: coloresPuntos, 
                    pointRadius: 5
                },
                {
                    label: "Media",
                    data: Array(datos.length).fill(media),
                    borderColor: 'green',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: "LSC",
                    data: Array(datos.length).fill(lsc),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: "LIC",
                    data: Array(datos.length).fill(lic),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Gráfico de Control - API ${idGrafico}`
                },
                tooltip: {
                    enabled: true
                },
                legend: {
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}