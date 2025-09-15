class Url {
    constructor(id, originalUrl, shortCode, userId, clicks, createdAt, updatedAt, deletedAt) {
        this.id = id;
        this.originalUrl = originalUrl;
        this.shortCode = shortCode;
        this.userId = userId;
        this.clicks = clicks || 0;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    static fromDB(row) {
        return new Url(
            row.id,
            row.original_url,
            row.short_code,
            row.user_id,
            row.clicks,
            row.created_at,
            row.updated_at,
            row.deleted_at
        );
    }

    isDeleted() {
        return this.deletedAt !== null;
    }

    canBeDeletedBy(userId) {
        return this.userId === null || this.userId === userId;
    }

    incrementClicks() {
        this.clicks = (this.clicks || 0) + 1;
    }
}

module.exports = Url;