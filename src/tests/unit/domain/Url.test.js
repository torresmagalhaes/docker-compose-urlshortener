const Url = require('../../../domain/entities/Url');

describe('URL Entity', () => {
    test('should create a URL with valid data', () => {
        const urlData = {
            id: 1,
            originalUrl: 'https://example.com',
            shortCode: 'abc123',
            userId: 1,
            clicks: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null
        };

        const url = new Url(
            urlData.id,
            urlData.originalUrl,
            urlData.shortCode,
            urlData.userId,
            urlData.clicks,
            urlData.createdAt,
            urlData.updatedAt,
            urlData.deletedAt
        );

        expect(url.id).toBe(urlData.id);
        expect(url.originalUrl).toBe(urlData.originalUrl);
        expect(url.shortCode).toBe(urlData.shortCode);
        expect(url.userId).toBe(urlData.userId);
        expect(url.clicks).toBe(urlData.clicks);
        expect(url.createdAt).toBe(urlData.createdAt);
        expect(url.updatedAt).toBe(urlData.updatedAt);
        expect(url.deletedAt).toBeNull();
    });

    test('isDeleted should return false when deletedAt is null', () => {
        const url = new Url(1, 'https://example.com', 'abc123', 1, 0, new Date(), new Date(), null);
        expect(url.isDeleted()).toBeFalsy();
    });

    test('isDeleted should return true when deletedAt has a value', () => {
        const url = new Url(1, 'https://example.com', 'abc123', 1, 0, new Date(), new Date(), new Date());
        expect(url.isDeleted()).toBeTruthy();
    });

    test('canBeDeletedBy should return true for URL owner', () => {
        const url = new Url(1, 'https://example.com', 'abc123', 1, 0, new Date(), new Date(), null);
        expect(url.canBeDeletedBy(1)).toBeTruthy();
    });

    test('canBeDeletedBy should return false for non-owner', () => {
        const url = new Url(1, 'https://example.com', 'abc123', 1, 0, new Date(), new Date(), null);
        expect(url.canBeDeletedBy(2)).toBeFalsy();
    });

    test('canBeDeletedBy should return true for public URLs', () => {
        const url = new Url(1, 'https://example.com', 'abc123', null, 0, new Date(), new Date(), null);
        expect(url.canBeDeletedBy(1)).toBeTruthy();
    });

    test('incrementClicks should increase clicks by 1', () => {
        const url = new Url(1, 'https://example.com', 'abc123', 1, 0, new Date(), new Date(), null);
        url.incrementClicks();
        expect(url.clicks).toBe(1);
    });
});