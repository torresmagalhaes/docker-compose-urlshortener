class User {
    constructor(id, email, passwordHash, createdAt, updatedAt, deletedAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    static fromDB(row) {
        return new User(
            row.id,
            row.email,
            row.password_hash,
            row.created_at,
            row.updated_at,
            row.deleted_at
        );
    }

    isDeleted() {
        return this.deletedAt !== null;
    }
}

module.exports = User;