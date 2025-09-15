class User {
    constructor(row) {
        this.id = row.id;
        this.email = row.email;
        this.passwordHash = row.password_hash; // pega do banco
        this.createdAt = row.created_at;
        this.updatedAt = row.updated_at;
        this.deletedAt = row.deleted_at;
    }

    isDeleted() {
        return this.deletedAt !== null;
    }
}

module.exports = User;