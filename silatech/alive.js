const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, getSystemInfo, getRandomItem } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["status", "uptime"],
    desc: "Check bot status",
    category: "general",
    react: "💚",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const systemInfo = getSystemInfo();
        const botImage = getRandomItem(config.BOT_IMAGES);

        const aliveText = `*╭━━━〔 🐢 ${config.BOT_NAME} 🐢 〕━━━┈⊷*
*┃🐢│ 𝚂𝚃𝙰𝚃𝚄𝚂: 🟢 𝙾𝙽𝙻𝙸𝙽𝙴*
*┃🐢│ 𝚅𝙴𝚁𝚂𝙸𝙾𝙽: ${config.BOT_VERSION}*
*┃🐢│ 𝙾𝚆𝙽𝙴𝚁: ${config.OWNER_NAME}*
*┃🐢│ 𝚄𝙿𝚃𝙸𝙼𝙴: ${systemInfo.uptime}*
*┃🐢│ 𝙼𝙴𝙼𝙾𝚁𝚈: ${systemInfo.memory.used}*
*┃🐢│ 𝙿𝙻𝙰𝚃𝙵𝙾𝚁𝙼: ${systemInfo.platform}*
*╰━━━━━━━━━━━━━━━┈⊷*

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: botImage },
            caption: aliveText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Alive error:', error);
        await conn.sendMessage(from, {
            text: `❌ Error: ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
