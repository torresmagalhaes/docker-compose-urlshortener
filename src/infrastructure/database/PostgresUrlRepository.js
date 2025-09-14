const Url = require('../../domain/entities/Url');
const IUrlRepository = require('../../domain/repositories/IUrlRepository');

class PostgresUrlRepository extends IUrlRepository {
    constructor(pool) {
        super();
        this.pool = pool;
    }

    async findById(id) {
        const result = await this.pool.query(
            'SELECT * FROM urls WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );
        return result.rows[0] ? new Url(result.rows[0]) : null;
    }

    async findByShortCode(shortCode) {
        const result = await this.pool.query(
            'SELECT * FROM urls WHERE short_code = $1 AND deleted_at IS NULL',
            [shortCode]
        );
        return result.rows[0] ? new Url(result.rows[0]) : null;
    }

    async create(urlData) {
        const result = await this.pool.query(
            'INSERT INTO urls (original_url, short_code, user_id) VALUES ($1, $2, $3) RETURNING *',
            [urlData.originalUrl, urlData.shortCode, urlData.userId]
        );
        return new Url(result.rows[0]);
    }

    async update(url) {
        const result = await this.pool.query(
            'UPDATE urls SET original_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [url.originalUrl, url.id]
        );
        return new Url(result.rows[0]);
    }

    async softDelete(id) {
        const now = new Date();
        await this.pool.query(
            'UPDATE urls SET deleted_at = $1, updated_at = $1 WHERE id = $2',
            [now, id]
        );
    }

    async findActive() {
        const result = await this.pool.query(
            'SELECT * FROM urls WHERE deleted_at IS NULL'
        );
        return result.rows.map(row => new Url(row));
    }

    async incrementClicks(id) {
        const result = await this.pool.query(
            'UPDATE urls SET clicks = clicks + 1 WHERE id = $1 RETURNING *',
            [id]
        );
        return new Url(result.rows[0]);
    }
}

module.exports = PostgresUrlRepository;