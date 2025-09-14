class Url {
    constructor({ id, original_url, short_code, user_id, clicks, created_at, updated_at, deleted_at }) {
        this.id = id;
        this.originalUrl = original_url;
        this.shortCode = short_code;
        this.userId = user_id;
        this.clicks = clicks;
        this.createdAt = created_at;
        this.updatedAt = updated_at;
        this.deletedAt = deleted_at;
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