const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "owner",
    alias: ["creator", "developer"],
    desc: "Show bot owner info",
    category: "general",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const ownerText = `*╭━━━〔 🐢 𝙾𝚆𝙽𝙴𝚁 𝙸𝙽𝙵𝙾 〕━━━┈⊷*
*┃🐢│ 𝙽𝙰𝙼𝙴: ${config.OWNER_NAME}*
*┃🐢│ 𝙽𝚄𝙼𝙱𝙴𝚁: ${config.OWNER_NUMBER}*
*┃🐢│ 𝚆𝙰: wa.me/${config.OWNER_NUMBER}*
*┃🐢│ 𝙲𝙷𝙰𝙽𝙽𝙴𝙻: @SILA_TECH*
*╰━━━━━━━━━━━━━━━┈⊷*

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: ownerText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Owner error:', error);
        await conn.sendMessage(from, {
            text: `❌ Error: ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
