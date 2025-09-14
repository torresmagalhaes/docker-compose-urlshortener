class IUserRepository {
    findById(id) { throw new Error('Not implemented'); }
    findByEmail(email) { throw new Error('Not implemented'); }
    create(user) { throw new Error('Not implemented'); }
    update(user) { throw new Error('Not implemented'); }
    softDelete(id) { throw new Error('Not implemented'); }
    findActive() { throw new Error('Not implemented'); }
}

module.exports = IUserRepository;