const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../infrastructure/config/auth');

class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async signup(email, password) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists with this email');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        return this.userRepository.create({ email, passwordHash });
    }

    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { token, user };
    }
}

module.exports = AuthService;