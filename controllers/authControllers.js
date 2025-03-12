const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "All fields are required" });

    const hashedPass = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPass], (err) => {
        if (err) return res.status(400).json({ error: "User already exists" });
        res.status(201).json({ message: "Registration successful" });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Invalid credentials" });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true }).json({ message: "Login successful", token });
    });
};

exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (!user) return res.status(404).json({ error: "User not found" });

        const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
        db.run("UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?", [resetToken, Date.now() + 900000, email]);

        console.log(`Reset link: http://localhost:3000/reset-password/${resetToken}`);
        res.json({ message: "Reset link sent" });
    });
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const hashedPass = await bcrypt.hash(newPassword, 10);
        db.run("UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?", [hashedPass, decoded.id], (err) => {
            if (err) return res.status(500).json({ error: "Error resetting password" });
            res.json({ message: "Password reset successful" });
        });
    } catch {
        res.status(400).json({ error: "Invalid or expired token" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token").json({ message: "Logout successful" });
};
