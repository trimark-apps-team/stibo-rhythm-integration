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
const commander_1 = require("commander");
const eventService_1 = require("../eventService");
const createCategoryEvent_1 = require("../events/taxonomy/createCategoryEvent");
//import { createCatalogEvent } from '../events/createCatalogEvent';
const program = new commander_1.Command();
program
    .name('send')
    .description('Send different event types')
    .argument('<type>', 'event type (category | catalog)')
    .action((type) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let event;
        switch (type.toLowerCase()) {
            case 'create-category':
                event = (0, createCategoryEvent_1.createCategoryEvent)();
                break;
            // case 'catalog':
            //event = createCatalogEvent();
            //break;
            default:
                console.error(`❌ Unknown event type: ${type}`);
                process.exit(1);
        }
        const result = yield (0, eventService_1.sendEvent)(event);
        console.log(`✅ ${type} event sent successfully:\n`, result);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('❌ General error:', err.message);
        }
        else if (typeof err === 'object' && err !== null && 'response' in err) {
            const axiosError = err;
            console.error('❌ API error:', ((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) || 'No response data');
        }
        else {
            console.error('❌ Unknown error:', err);
        }
    }
}));
program.parse();
