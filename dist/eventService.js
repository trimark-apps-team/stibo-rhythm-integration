"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEvent = sendEvent;
const axios_1 = __importDefault(require("axios"));
const authService_1 = require("./authService");
const constants_1 = require("./constants");
function sendEvent(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const token = yield (0, authService_1.getAuthToken)();
            if (!token) {
                throw new Error('No token received from auth service');
            }
            console.log('📤 Sending event to:', constants_1.EVENT_ENDPOINT);
            console.log('🔐 Using token (first 40 chars):', token.slice(0, 40), '...');
            const response = yield axios_1.default.post(constants_1.EVENT_ENDPOINT, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Event sent successfully.');
            return response.data;
        }
        catch (err) {
            if (axios_1.default.isAxiosError(err)) {
                console.error('❌ Axios error:', {
                    status: (_a = err.response) === null || _a === void 0 ? void 0 : _a.status,
                    data: (_b = err.response) === null || _b === void 0 ? void 0 : _b.data,
                    headers: (_c = err.response) === null || _c === void 0 ? void 0 : _c.headers
                });
            }
            else if (err instanceof Error) {
                console.error('❌ General error:', err.message);
            }
            else {
                console.error('❌ Unknown error:', err);
            }
            throw err; // rethrow so CLI or test runner can handle
        }
    });
}
