const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const { saveSettings } = require('../lib/database');

cmd({
    pattern: "setprefix",
    alias: ["prefix"],
    desc: "Change bot prefix (use 'none' for no prefix)",
    category: "owner",
    react: "⚙️",
    filename: __filename
}, async (conn, mek, m, { from, sender, senderNumber, args, isOwner }) => {
    try {
        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: "🚫 *𝙾𝚠𝚗𝚎𝚛-𝚘𝚗𝚕𝚢 𝚌𝚘𝚖𝚖𝚊𝚗𝚍!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const newPrefix = args[0]?.toLowerCase() || '';
        
        if (!newPrefix) {
            return await conn.sendMessage(from, {
                text: `📌 *𝙲𝚞𝚛𝚛𝚎𝚗𝚝 𝙿𝚛𝚎𝚏𝚒𝚡:* ${config.PREFIX}\n\n𝚄𝚜𝚊𝚐𝚎: .setprefix <new prefix>\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .setprefix !\n𝙾𝚛: .setprefix none (𝚏𝚘𝚛 𝚗𝚘 𝚙𝚛𝚎𝚏𝚒𝚡)`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Update config
        if (newPrefix === 'none') {
            config.PREFIX = '';
            config.NO_PREFIX = 'true';
        } else {
            config.PREFIX = newPrefix;
            config.NO_PREFIX = 'false';
        }

        // Save to database
        await saveSettings(senderNumber, {
            PREFIX: config.PREFIX,
            NO_PREFIX: config.NO_PREFIX
        });

        await conn.sendMessage(from, {
            text: `✅ *𝙿𝚛𝚎𝚏𝚒𝚡 𝚞𝚙𝚍𝚊𝚝𝚎𝚍!*\n\n𝙽𝚎𝚠 𝙿𝚛𝚎𝚏𝚒𝚡: ${config.PREFIX || '𝙽𝚘 𝙿𝚛𝚎𝚏𝚒𝚡'}\n𝙽𝚘 𝙿𝚛𝚎𝚏𝚒𝚡 𝙼𝚘𝚍𝚎: ${config.NO_PREFIX === 'true' ? '✅ 𝙴𝚗𝚊𝚋𝚕𝚎𝚍' : '❌ 𝙳𝚒𝚜𝚊𝚋𝚕𝚎𝚍'}\n\n${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Setprefix error:', error);
        await conn.sendMessage(from, {
            text: `❌ Error: ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
