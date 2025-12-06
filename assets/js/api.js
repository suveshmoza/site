var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { API_URL } from './config.js';
export function fetchZones() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(`${API_URL}/zones`);
            const data = yield res.json();
            return data.zones;
        }
        catch (e) {
            console.error("Fetch failed", e);
            return [];
        }
    });
}
export function getZoneAQI(zoneId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(`${API_URL}/aqi/${zoneId}`);
            return yield res.json();
        }
        catch (e) {
            return null;
        }
    });
}
