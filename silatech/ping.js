const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "ping",
    alias: ["p", "speed"],
    desc: "Check bot response time",
    category: "general",
    react: "🏓",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const start = Date.now();
        const pingMsg = await conn.sendMessage(from, { 
            text: '🏓 *Pinging...*',
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
        
        const end = Date.now();
        const latency = end - start;
        
        await conn.sendMessage(from, {
            text: `🏓 *Pong!* ${latency}ms\n\n🕒 *Time:* ${new Date().toLocaleString()}\n\n${config.BOT_FOOTER}`,
            edit: pingMsg.key,
            contextInfo: getContextInfo({ sender: sender })
        });
        
    } catch (error) {
        console.error('Ping error:', error);
        await conn.sendMessage(from, {
            text: `❌ Error: ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
