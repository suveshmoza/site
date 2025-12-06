const API_URL = "https://api.breatheoss.app";

let aqiChart = null;

async function loadZones() {
    try {
        const res = await fetch(`${API_URL}/zones`);
        const data = await res.json();
        const select = document.getElementById('zoneSelect');

        select.innerHTML = '';

        data.zones.forEach(z => {
            const opt = document.createElement('option');
            opt.value = z.id;
            opt.innerText = z.name;
            select.appendChild(opt);
        });

        if (data.zones.length > 0) loadZoneData(data.zones[0].id);
    } catch (e) {
        console.error("Connection failed. Is the backend running?", e);
        document.getElementById('aqiValue').innerText = "ERR";
    }
}

async function loadZoneData(zoneId) {
    try {
        const res = await fetch(`${API_URL}/aqi/${zoneId}`);
        const data = await res.json();
        updateUI(data);
    } catch (e) {
        console.error("Failed to load zone data", e);
    }
}

function updateUI(data) {
    const valEl = document.getElementById('aqiValue');
    valEl.innerText = data.aqi;

    valEl.className = 'aqi-value'; 
    valEl.classList.add(getAQIColorClass(data.aqi));
    
    document.getElementById('mainPollutant').innerText = `Main Pollutant: ${data.main_pollutant.toUpperCase()}`;

    const history = data.history.sort((a, b) => a.ts - b.ts);
    
    const labels = history.map(h => {
        const date = new Date(h.ts * 1000);
        return date.getHours() + ':00';
    });
    const values = history.map(h => h.aqi);

    renderChart(labels, values);
}

function renderChart(labels, values) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'AQI',
                data: values,
                borderColor: '#38bdf8',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#94a3b8', maxTicksLimit: 6 }, grid: { display: false } },
                y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            }
        }
    });
}

function getAQIColorClass(aqi) {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'satisfactory';
    if (aqi <= 200) return 'moderate';
    if (aqi <= 300) return 'poor';
    if (aqi <= 400) return 'very-poor';
    return 'severe';
}

document.addEventListener('DOMContentLoaded', () => {
    const zoneSelect = document.getElementById('zoneSelect');
    if (zoneSelect) {
        zoneSelect.addEventListener('change', (e) => loadZoneData(e.target.value));
        loadZones();
    }
});