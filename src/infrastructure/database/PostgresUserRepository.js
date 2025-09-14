const User = require('../../domain/entities/User');
const IUserRepository = require('../../domain/repositories/IUserRepository');

class PostgresUserRepository extends IUserRepository {
    constructor(pool) {
        super();
        this.pool = pool;
    }

    async findById(id) {
        const result = await this.pool.query(
            'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );
        return result.rows[0] ? new User(result.rows[0]) : null;
    }

    async findByEmail(email) {
        const result = await this.pool.query(
            'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        );
        return result.rows[0] ? new User(result.rows[0]) : null;
    }

    async create(userData) {
        const result = await this.pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
            [userData.email, userData.passwordHash]
        );
        return new User(result.rows[0]);
    }

    async update(user) {
        const result = await this.pool.query(
            'UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [user.email, user.id]
        );
        return new User(result.rows[0]);
    }

    async softDelete(id) {
        const now = new Date();
        await this.pool.query(
            'UPDATE users SET deleted_at = $1, updated_at = $1 WHERE id = $2',
            [now, id]
        );
    }

    async findActive() {
        const result = await this.pool.query(
            'SELECT * FROM users WHERE deleted_at IS NULL'
        );
        return result.rows.map(row => new User(row));
    }
}

module.exports = PostgresUserRepository;