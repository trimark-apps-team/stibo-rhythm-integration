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
Object.defineProperty(exports, "__esModule", { value: true });
const tokenService_1 = require("../src/tokenService");
describe('getAccessToken', () => {
    it('should return a token', () => __awaiter(void 0, void 0, void 0, function* () {
        const token = yield (0, tokenService_1.getAccessToken)();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(10);
    }));
});
