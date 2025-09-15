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

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            // Apenas o próprio usuário pode se deletar
            if (parseInt(id) !== userId) {
                return res.status(403).json({ error: 'Not authorized to delete this user' });
            }

            await this.authService.deleteUser(id);
            res.json({ message: 'User successfully deleted' });
        } catch (err) {
            console.error(err.message);
            if (err.message === 'User not found') {
                res.status(404).json({ error: err.message });
            } else {
                res.status(500).json({ error: 'Server error while deleting user' });
            }
        }
    }
}

module.exports = AuthController;