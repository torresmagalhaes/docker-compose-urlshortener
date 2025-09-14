class Url {
    constructor(id, originalUrl, shortCode, userId, clicks, createdAt, updatedAt, deletedAt) {
        this.id = id;
        this.originalUrl = originalUrl;
        this.shortCode = shortCode;
        this.userId = userId;
        this.clicks = clicks;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    isDeleted() {
        return this.deletedAt !== null;
    }

    canBeDeletedBy(userId) {
        return this.userId === null || this.userId === userId;
    }

    incrementClicks() {
        this.clicks += 1;
    }
}

module.exports = Url;