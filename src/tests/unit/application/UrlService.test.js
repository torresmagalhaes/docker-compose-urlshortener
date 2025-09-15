const UrlService = require('../../../application/services/UrlService');

// Mock do UrlRepository
const mockUrlRepository = {
    findByShortCode: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    incrementClicks: jest.fn(),
    softDelete: jest.fn(),
};

describe('UrlService', () => {
    let urlService;

    beforeEach(() => {
        jest.clearAllMocks();
        urlService = new UrlService(mockUrlRepository);
    });

    describe('createShortUrl', () => {
        test('should create a short URL successfully', async () => {
            const originalUrl = 'https://example.com';
            const userId = 1;
            const mockUrl = {
                id: 1,
                originalUrl,
                shortCode: 'abc123',
                userId,
                clicks: 0
            };

            // Mock do findByShortCode retornando null primeiro e depois o URL
            mockUrlRepository.findByShortCode
                .mockResolvedValueOnce(null);
            mockUrlRepository.create.mockResolvedValue(mockUrl);

            const result = await urlService.createShortUrl(originalUrl, userId);

            expect(mockUrlRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                originalUrl,
                userId,
                clicks: 0
            }));
            expect(result).toEqual(mockUrl);
        });

        test('should retry if generated short code already exists', async () => {
            const originalUrl = 'https://example.com';
            const userId = 1;
            const mockUrl = {
                id: 1,
                originalUrl,
                shortCode: 'xyz789',
                userId,
                clicks: 0
            };

            // Mock do findByShortCode retornando um URL existente e depois null
            mockUrlRepository.findByShortCode
                .mockResolvedValueOnce({ id: 2 })
                .mockResolvedValueOnce(null);
            mockUrlRepository.create.mockResolvedValue(mockUrl);

            const result = await urlService.createShortUrl(originalUrl, userId);

            expect(mockUrlRepository.findByShortCode).toHaveBeenCalledTimes(2);
            expect(mockUrlRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                originalUrl,
                userId,
                clicks: 0
            }));
            expect(result).toEqual(mockUrl);
        });
    });

    describe('getUrl', () => {
        test('should get URL and increment clicks', async () => {
            const shortCode = 'abc123';
            const mockUrl = {
                id: 1,
                originalUrl: 'https://example.com',
                shortCode,
                clicks: 0
            };

            mockUrlRepository.findByShortCode.mockResolvedValue(mockUrl);
            mockUrlRepository.incrementClicks.mockResolvedValue({ ...mockUrl, clicks: 1 });

            const result = await urlService.getUrl(shortCode);

            expect(mockUrlRepository.findByShortCode).toHaveBeenCalledWith(shortCode);
            expect(mockUrlRepository.incrementClicks).toHaveBeenCalledWith(mockUrl.id);
            expect(result.clicks).toBe(1);
        });

        test('should throw error if URL not found', async () => {
            const shortCode = 'notfound';

            mockUrlRepository.findByShortCode.mockResolvedValue(null);

            await expect(urlService.getUrl(shortCode))
                .rejects
                .toThrow('URL not found');
        });
    });

    describe('deleteUrl', () => {
        test('should delete URL if user is owner', async () => {
            const urlId = 1;
            const userId = 1;
            const mockUrl = {
                id: urlId,
                userId,
                canBeDeletedBy: jest.fn().mockReturnValue(true)
            };

            mockUrlRepository.findById.mockResolvedValue(mockUrl);

            await urlService.deleteUrl(urlId, userId);

            expect(mockUrlRepository.findById).toHaveBeenCalledWith(urlId);
            expect(mockUrl.canBeDeletedBy).toHaveBeenCalledWith(userId);
            expect(mockUrlRepository.softDelete).toHaveBeenCalledWith(urlId);
        });

        test('should throw error if URL not found', async () => {
            const urlId = 999;
            const userId = 1;

            mockUrlRepository.findById.mockResolvedValue(null);

            await expect(urlService.deleteUrl(urlId, userId))
                .rejects
                .toThrow('URL not found');
        });

        test('should throw error if user is not authorized', async () => {
            const urlId = 1;
            const userId = 2;
            const mockUrl = {
                id: urlId,
                userId: 1,
                canBeDeletedBy: jest.fn().mockReturnValue(false)
            };

            mockUrlRepository.findById.mockResolvedValue(mockUrl);

            await expect(urlService.deleteUrl(urlId, userId))
                .rejects
                .toThrow('Not authorized to delete this URL');
        });
    });

    describe('listUrls', () => {
        beforeEach(() => {
            mockUrlRepository.findAll = jest.fn();
            mockUrlRepository.findByUserId = jest.fn();
        });

        test('should list all URLs when no userId is provided', async () => {
            const mockUrls = [
                {
                    id: 1,
                    originalUrl: 'https://example1.com',
                    shortCode: 'abc123',
                    userId: 1,
                    clicks: 0
                },
                {
                    id: 2,
                    originalUrl: 'https://example2.com',
                    shortCode: 'def456',
                    userId: 2,
                    clicks: 5
                }
            ];

            mockUrlRepository.findAll.mockResolvedValue(mockUrls);

            const result = await urlService.listUrls();

            expect(mockUrlRepository.findAll).toHaveBeenCalled();
            expect(mockUrlRepository.findByUserId).not.toHaveBeenCalled();
            expect(result).toEqual(mockUrls);
        });

        test('should list URLs filtered by userId when provided', async () => {
            const userId = 1;
            const mockUrls = [
                {
                    id: 1,
                    originalUrl: 'https://example1.com',
                    shortCode: 'abc123',
                    userId: 1,
                    clicks: 0
                }
            ];

            mockUrlRepository.findByUserId.mockResolvedValue(mockUrls);

            const result = await urlService.listUrls(userId);

            expect(mockUrlRepository.findByUserId).toHaveBeenCalledWith(userId);
            expect(mockUrlRepository.findAll).not.toHaveBeenCalled();
            expect(result).toEqual(mockUrls);
        });

        test('should return empty array when no URLs found for user', async () => {
            const userId = 999;
            mockUrlRepository.findByUserId.mockResolvedValue([]);

            const result = await urlService.listUrls(userId);

            expect(mockUrlRepository.findByUserId).toHaveBeenCalledWith(userId);
            expect(result).toEqual([]);
        });

        test('should return empty array when no URLs exist', async () => {
            mockUrlRepository.findAll.mockResolvedValue([]);

            const result = await urlService.listUrls();

            expect(mockUrlRepository.findAll).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });
});