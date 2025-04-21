"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryEvent = createCategoryEvent;
function createCategoryEvent() {
    return {
        context: 'catalogs::categories',
        data: {
            internalName: 'ZZ_CAT1',
            isVisible: true,
            key: 'ZZ_CAT1',
            texts: [
                {
                    description: 'ZZ Cat 1 descX',
                    languageCode: 'en',
                    longDescription: 'ZZ Cat 1 a longdescriptionX',
                    name: 'ZZ Cat 1 a nameX'
                }
            ],
            recipientEmails: ['ben.ray@trimarkusa.com']
        },
        dataFormatVersion: 0,
        dataId: 'category-test-id',
        source: 'source',
        type: 'Created'
    };
}
