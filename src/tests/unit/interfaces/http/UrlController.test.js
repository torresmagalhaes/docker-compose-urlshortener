const UrlController = require('../../../../interfaces/http/UrlController');

describe('UrlController', () => {
    let urlController;
    let mockUrlService;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockUrlService = {
            createShortUrl: jest.fn(),
            getUrl: jest.fn(),
            deleteUrl: jest.fn(),
            listUrls: jest.fn()
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            redirect: jest.fn()
        };

        urlController = new UrlController(mockUrlService);
    });

    describe('listUrls', () => {
        test('should list all URLs when no userId provided', async () => {
            const mockUrls = [
                {
                    id: 1,
                    originalUrl: 'https://example1.com',
                    shortCode: 'abc123',
                    userId: 1,
                    clicks: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            mockReq = {
                query: {}
            };

            mockUrlService.listUrls.mockResolvedValue(mockUrls);

            await urlController.listUrls(mockReq, mockRes);

            expect(mockUrlService.listUrls).toHaveBeenCalledWith(undefined);
            expect(mockRes.json).toHaveBeenCalledWith({
                count: 1,
                urls: expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        originalUrl: 'https://example1.com',
                        shortCode: 'abc123',
                        shortUrl: expect.stringContaining('abc123'),
                        userId: 1,
                        clicks: 0
                    })
                ])
            });
        });

        test('should list URLs filtered by userId when provided', async () => {
            const userId = "1";
            const mockUrls = [
                {
                    id: 1,
                    originalUrl: 'https://example1.com',
                    shortCode: 'abc123',
                    userId: 1,
                    clicks: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            mockReq = {
                query: { userId }
            };

            mockUrlService.listUrls.mockResolvedValue(mockUrls);

            await urlController.listUrls(mockReq, mockRes);

            expect(mockUrlService.listUrls).toHaveBeenCalledWith(userId);
            expect(mockRes.json).toHaveBeenCalledWith({
                count: 1,
                urls: expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        userId: 1
                    })
                ])
            });
        });

        test('should handle empty results', async () => {
            mockReq = {
                query: {}
            };

            mockUrlService.listUrls.mockResolvedValue([]);

            await urlController.listUrls(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                count: 0,
                urls: []
            });
        });

        test('should handle errors gracefully', async () => {
            mockReq = {
                query: {}
            };

            const error = new Error('Database error');
            mockUrlService.listUrls.mockRejectedValue(error);

            await urlController.listUrls(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Server error fetching URLs'
            });
        });
    });
});