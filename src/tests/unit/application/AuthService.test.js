const AuthService = require('../../../application/services/AuthService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../infrastructure/config/auth');

// Mock do UserRepository
const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
};

describe('AuthService', () => {
    let authService;

    beforeEach(() => {
        // Limpa todos os mocks antes de cada teste
        jest.clearAllMocks();
        authService = new AuthService(mockUserRepository);
    });

    describe('signup', () => {
        test('should create a new user successfully', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            const hashedPassword = 'hashedpassword';
            const mockUser = { id: 1, email };

            // Mock do bcrypt.hash
            bcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);

            // Mock do findByEmail retornando null (usuário não existe)
            mockUserRepository.findByEmail.mockResolvedValue(null);

            // Mock do create retornando um novo usuário
            mockUserRepository.create.mockResolvedValue(mockUser);

            const result = await authService.signup(email, password);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                email,
                passwordHash: hashedPassword,
            });
            expect(result).toEqual(mockUser);
        });

        test('should throw error if user already exists', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            // Mock do findByEmail retornando um usuário existente
            mockUserRepository.findByEmail.mockResolvedValue({ id: 1, email });

            await expect(authService.signup(email, password))
                .rejects
                .toThrow('User already exists with this email');
        });
    });

    describe('login', () => {
        test('should login successfully with correct credentials', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            const hashedPassword = 'hashedpassword';
            const mockUser = { id: 1, email, passwordHash: hashedPassword };

            // Mock do findByEmail retornando um usuário
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            // Mock do bcrypt.compare
            bcrypt.compare = jest.fn().mockResolvedValue(true);

            const result = await authService.login(email, password);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(result.user).toEqual(mockUser);
        });

        test('should throw error if user not found', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            // Mock do findByEmail retornando null
            mockUserRepository.findByEmail.mockResolvedValue(null);

            await expect(authService.login(email, password))
                .rejects
                .toThrow('Invalid credentials');
        });

        test('should throw error if password is incorrect', async () => {
            const email = 'test@example.com';
            const password = 'wrongpassword';
            const hashedPassword = 'hashedpassword';
            const mockUser = { id: 1, email, passwordHash: hashedPassword };

            // Mock do findByEmail retornando um usuário
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            // Mock do bcrypt.compare retornando false
            bcrypt.compare = jest.fn().mockResolvedValue(false);

            await expect(authService.login(email, password))
                .rejects
                .toThrow('Invalid credentials');
        });
    });
});