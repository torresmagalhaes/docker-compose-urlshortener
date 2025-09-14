const User = require('../../../domain/entities/User');

describe('User Entity', () => {
    test('should create a user with valid data', () => {
        const userData = {
            id: 1,
            email: 'test@example.com',
            passwordHash: 'hashedpassword123',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null
        };

        const user = new User(
            userData.id,
            userData.email,
            userData.passwordHash,
            userData.createdAt,
            userData.updatedAt,
            userData.deletedAt
        );

        expect(user.id).toBe(userData.id);
        expect(user.email).toBe(userData.email);
        expect(user.passwordHash).toBe(userData.passwordHash);
        expect(user.createdAt).toBe(userData.createdAt);
        expect(user.updatedAt).toBe(userData.updatedAt);
        expect(user.deletedAt).toBeNull();
    });

    test('isDeleted should return false when deletedAt is null', () => {
        const user = new User(1, 'test@example.com', 'hash', new Date(), new Date(), null);
        expect(user.isDeleted()).toBeFalsy();
    });

    test('isDeleted should return true when deletedAt has a value', () => {
        const user = new User(1, 'test@example.com', 'hash', new Date(), new Date(), new Date());
        expect(user.isDeleted()).toBeTruthy();
    });
});