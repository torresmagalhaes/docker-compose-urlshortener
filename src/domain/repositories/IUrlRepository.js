class IUrlRepository {
    findById(id) { throw new Error('Not implemented'); }
    findByShortCode(shortCode) { throw new Error('Not implemented'); }
    create(url) { throw new Error('Not implemented'); }
    update(url) { throw new Error('Not implemented'); }
    softDelete(id) { throw new Error('Not implemented'); }
    findActive() { throw new Error('Not implemented'); }
    incrementClicks(id) { throw new Error('Not implemented'); }
}

module.exports = IUrlRepository;