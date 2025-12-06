var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getZoneAQI } from './api.js';
import { getAQIColor, getCurrentTheme } from './utils.js';
let mapInstance = null;
let mapTileLayer = null;
export function initMap(allZones) {
    if (mapInstance)
        return;
    // center on j&k
    mapInstance = L.map('map-container', { zoomControl: false }).setView([33.9, 75.5], 8);
    updateMapTiles(getCurrentTheme());
    populateMapMarkers(allZones);
}
export function updateMapTiles(theme) {
    if (!mapInstance)
        return;
    if (mapTileLayer)
        mapTileLayer.remove();
    const url = theme === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    mapTileLayer = L.tileLayer(url, {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
    }).addTo(mapInstance);
}
export function resizeMap() {
    if (mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 100);
    }
}
function populateMapMarkers(allZones) {
    allZones.forEach((z) => __awaiter(this, void 0, void 0, function* () {
        if (!z.lat || !z.lon)
            return;
        const data = yield getZoneAQI(z.id);
        if (!data)
            return;
        const colors = getAQIColor(data.aqi);
        const markerHtml = `
            <div style="
                background-color: ${colors.hex};
                width: 24px; height: 24px;
                border-radius: 50%;
                border: 2px solid #fff;
                display: flex; align-items: center; justify-content: center;
                color: #000; font-weight: bold; font-size: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
            ">${data.aqi}</div>
        `;
        const icon = L.divIcon({
            html: markerHtml,
            className: 'custom-pin',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        L.marker([z.lat, z.lon], { icon: icon })
            .addTo(mapInstance)
            .bindPopup(`
                <div style="text-align:center; color:#333;">
                    <h3 style="margin:0">${z.name}</h3>
                    <div style="font-size:24px; font-weight:bold; margin:5px 0;">${data.aqi} AQI</div>
                    <small>Primary: ${data.main_pollutant.toUpperCase()}</small>
                </div>
            `);
    }));
}
