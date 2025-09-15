class UrlService {
    constructor(urlRepository) {
        this.urlRepository = urlRepository;
    }

    generateShortCode() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length: 6 })
            .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
            .join('');
    }

    async createShortUrl(originalUrl, userId = null) {
        let shortCode;
        let exists;
        do {
            shortCode = this.generateShortCode();
            exists = await this.urlRepository.findByShortCode(shortCode);
        } while (exists);

        return this.urlRepository.create({
            originalUrl,
            shortCode,
            userId,
            clicks: 0
        });
    }

    async getUrl(shortCode) {
        const url = await this.urlRepository.findByShortCode(shortCode);
        if (!url) {
            throw new Error('URL not found');
        }
        const updatedUrl = await this.urlRepository.incrementClicks(url.id);
        return updatedUrl;
    }

    async deleteUrl(id, userId) {
        const url = await this.urlRepository.findById(id);
        if (!url) {
            throw new Error('URL not found');
        }
        if (!url.canBeDeletedBy(userId)) {
            throw new Error('Not authorized to delete this URL');
        }
        return this.urlRepository.softDelete(id);
    }

    async listUrls(userId = null) {
        if (userId) {
            return this.urlRepository.findByUserId(userId);
        }
        return this.urlRepository.findAll();
    }
}

module.exports = UrlService;