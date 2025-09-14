class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    async signup(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.authService.signup(email, password);
            res.status(201).json({
                message: 'User created successfully',
                user
            });
        } catch (err) {
            console.error(err.message);
            res.status(400).json({ error: err.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { token, user } = await this.authService.login(email, password);
            res.status(200).json({
                message: 'Login successful',
                token,
                user
            });
        } catch (err) {
            console.error(err.message);
            res.status(401).json({ error: err.message });
        }
    }
}

module.exports = AuthController;