const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const { startBot, autoReconnectAll } = require('./sila');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-panel.html'));
});

// Pairing endpoint
app.get('/code', async (req, res) => {
    const { number } = req.query;
    
    if (!number) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Number parameter is required' 
        });
    }

    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    
    if (!sanitizedNumber || sanitizedNumber.length < 10) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Invalid phone number format' 
        });
    }

    if (global.activeSockets?.has(sanitizedNumber)) {
        return res.status(200).json({
            status: 'already_connected',
            message: `Number ${sanitizedNumber} is already connected.`
        });
    }

    await startBot(number, res);
});

// Stats endpoint
app.get('/stats', (req, res) => {
    res.json({
        activeSessions: global.activeSockets?.size || 0,
        totalCommands: global.commands?.size || 0,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╭━━━〔 🐢 𝚂𝙸𝙻𝙰 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃 🐢 〕━━━┈⊷
    ┃
    ┃ 🚀 Server: http://localhost:${PORT}
    ┃ 🔗 Pair: http://localhost:${PORT}/pair
    ┃ 👑 Admin: http://localhost:${PORT}/admin
    ┃
    ╰━━━━━━━━━━━━━━━┈⊷
    `);
});

module.exports = app;
