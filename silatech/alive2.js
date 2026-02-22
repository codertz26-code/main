const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, getSystemInfo, getRandomItem } = require('../lib/functions');

cmd({
    pattern: "alive2",
    alias: ["status2", "uptime2", "test"],
    desc: "Check bot status with interactive buttons",
    category: "general",
    react: "🔘",
    filename: __filename
}, async (conn, mek, m, { from, sender, senderNumber, isOwner, prefix }) => {
    try {
        const systemInfo = getSystemInfo();
        const botImage = getRandomItem(config.BOT_IMAGES);
        const currentTime = new Date().toLocaleString('en-US', { 
            timeZone: 'Africa/Nairobi',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const aliveText = `*╭━━━〔 🐢 ${config.BOT_NAME} 🐢 〕━━━┈⊷*
*┃🐢│ 𝚂𝚃𝙰𝚃𝚄𝚂: 🟢 𝙾𝙽𝙻𝙸𝙽𝙴*
*┃🐢│ 𝚅𝙴𝚁𝚂𝙸𝙾𝙽: ${config.BOT_VERSION}*
*┃🐢│ 𝙾𝚆𝙽𝙴𝚁: ${config.OWNER_NAME}*
*┃🐢│ 𝚄𝙿𝚃𝙸𝙼𝙴: ${systemInfo.uptime}*
*┃🐢│ 𝙼𝙴𝙼𝙾𝚁𝚈: ${systemInfo.memory.used}*
*┃🐢│ 𝚃𝙸𝙼𝙴: ${currentTime}*
*╰━━━━━━━━━━━━━━━┈⊷*

*📌 𝙲𝚑𝚘𝚘𝚜𝚎 𝚊𝚗 𝚘𝚙𝚝𝚒𝚘𝚗 𝚋𝚎𝚕𝚘𝚠:*

${config.BOT_FOOTER}`;

        // Create buttons
        const buttons = [
            { 
                buttonId: `${prefix}menu`, 
                buttonText: { displayText: '📜 𝙼𝙴𝙽𝚄' }, 
                type: 1 
            },
            { 
                buttonId: `${prefix}owner`, 
                buttonText: { displayText: '👑 𝙾𝚆𝙽𝙴𝚁' }, 
                type: 1 
            },
            { 
                buttonId: `${prefix}ping`, 
                buttonText: { displayText: '🏓 𝙿𝙸𝙽𝙶' }, 
                type: 1 
            }
        ];

        // Send image with buttons
        await conn.sendMessage(from, {
            image: { url: botImage },
            caption: aliveText,
            buttons: buttons,
            viewOnce: true,
            headerType: 4, // 4 = IMAGE
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Also send reaction
        await conn.sendMessage(from, {
            react: { text: '🔘', key: mek.key }
        });

    } catch (error) {
        console.error('Alive2 command error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
