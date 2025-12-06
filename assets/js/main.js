var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { STORAGE_KEY_PINS } from './config.js';
import { fetchZones, getZoneAQI } from './api.js';
import { initTheme } from './utils.js';
import { initMap, updateMapTiles, resizeMap } from './map.js';
import { renderDashboardCard, renderExploreItem, updateDetailView, updateChartTheme } from './ui.js';
let allZones = [];
let pinnedZoneIds = JSON.parse(localStorage.getItem(STORAGE_KEY_PINS) || '[]');
// init
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    initTheme((newTheme) => {
        updateMapTiles(newTheme);
        updateChartTheme();
    });
    allZones = yield fetchZones();
    refreshDashboard();
    updateNavHighlight('dashboard');
    const searchInput = document.getElementById('zone-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const target = e.target;
            refreshExploreList(target.value);
        });
    }
}));
// controller actions
function refreshDashboard() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById('pinned-container');
        const emptyState = document.getElementById('empty-state');
        if (!container || !emptyState)
            return;
        container.innerHTML = '';
        if (pinnedZoneIds.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');
        for (const id of pinnedZoneIds) {
            const zone = allZones.find(z => z.id === id);
            if (!zone)
                continue;
            const data = yield getZoneAQI(id);
            if (!data)
                continue;
            const card = renderDashboardCard(zone, data, () => openDetails(zone.id));
            container.appendChild(card);
        }
    });
}
function refreshExploreList(filter = "") {
    const container = document.getElementById('zone-list');
    if (!container)
        return;
    container.innerHTML = '';
    const filtered = allZones.filter(z => z.name.toLowerCase().includes(filter.toLowerCase()));
    filtered.forEach(zone => {
        const isPinned = pinnedZoneIds.includes(zone.id);
        const card = renderExploreItem(zone, isPinned, () => togglePin(zone.id));
        container.appendChild(card);
    });
}
function togglePin(id) {
    if (pinnedZoneIds.includes(id)) {
        pinnedZoneIds = pinnedZoneIds.filter(zid => zid !== id);
    }
    else {
        pinnedZoneIds.push(id);
    }
    localStorage.setItem(STORAGE_KEY_PINS, JSON.stringify(pinnedZoneIds));
    refreshDashboard();
}
function openDetails(zoneId) {
    return __awaiter(this, void 0, void 0, function* () {
        handleShowView('details');
        const zone = allZones.find(z => z.id === zoneId);
        if (!zone)
            return;
        const data = yield getZoneAQI(zoneId);
        if (data) {
            updateDetailView(zone, data);
        }
    });
}
// navigation logic
window.showView = handleShowView;
window.openModal = (id) => { var _a; return (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.classList.remove('hidden'); };
window.closeModal = (id) => { var _a; return (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.classList.add('hidden'); };
function handleShowView(viewName) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active-view'));
    const view = document.getElementById(`view-${viewName}`);
    if (view)
        view.classList.add('active-view');
    updateNavHighlight(viewName);
    if (viewName === 'map') {
        initMap(allZones);
        resizeMap();
    }
    if (viewName === 'explore') {
        const searchInput = document.getElementById('zone-search');
        refreshExploreList(searchInput ? searchInput.value : "");
    }
}
function updateNavHighlight(viewName) {
    document.querySelectorAll('.nav-item, .nav-btn').forEach(el => el.classList.remove('active'));
    let target = viewName;
    if (viewName === 'details')
        target = 'dashboard';
    const mobBtn = document.getElementById(`nav-${target}`);
    if (mobBtn)
        mobBtn.classList.add('active');
    const sideBtn = document.getElementById(`side-${target}`);
    if (sideBtn)
        sideBtn.classList.add('active');
}
