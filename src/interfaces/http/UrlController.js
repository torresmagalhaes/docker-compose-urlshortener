class UrlController {
    constructor(urlService) {
        this.urlService = urlService;
    }

    async shorten(req, res) {
        try {
            const { url } = req.body;
            const userId = req.user?.userId;
            
            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }

            const shortenedUrl = await this.urlService.createShortUrl(url, userId);
            res.status(201).json({
                original_url: url,
                short_url: `http://localhost:1500/${shortenedUrl.shortCode}`,
                short_code: shortenedUrl.shortCode,
                created_at: shortenedUrl.createdAt
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Server error while shortening URL' });
        }
    }

    async redirect(req, res) {
        try {
            const { shortCode } = req.params;
            const url = await this.urlService.getUrl(shortCode);
            res.redirect(url.originalUrl);
        } catch (err) {
            console.error(err.message);
            res.status(404).json({ error: 'Short URL not found' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            await this.urlService.deleteUrl(id, userId);
            res.json({ message: 'URL successfully deleted' });
        } catch (err) {
            console.error(err.message);
            if (err.message === 'Not authorized to delete this URL') {
                res.status(403).json({ error: err.message });
            } else if (err.message === 'URL not found') {
                res.status(404).json({ error: err.message });
            } else {
                res.status(500).json({ error: 'Server error while deleting URL' });
            }
        }
    }

    async listActive(req, res) {
        try {
            const urls = await this.urlService.findActive();
            res.json(urls);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Server error fetching URLs' });
        }
    }
}

module.exports = UrlController;