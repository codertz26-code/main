const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, getSystemInfo, getRandomItem } = require('../lib/functions');

cmd({
    pattern: "menu",
    alias: ["help", "commands", "start"],
    desc: "Show all available commands",
    category: "general",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, sender, senderNumber, isOwner, prefix }) => {
    try {
        const systemInfo = getSystemInfo();
        const totalCommands = global.commands.size;
        const botImage = getRandomItem(config.BOT_IMAGES);

        // Group commands by category
        const categories = {};
        global.commands.forEach((cmd, name) => {
            if (!categories[cmd.category]) categories[cmd.category] = [];
            categories[cmd.category].push(name);
        });

        let menuText = `*╭━━━〔 🐢 ${config.BOT_NAME} 🐢 〕━━━┈⊷*\n`;
        menuText += `*┃🐢│ 𝚄𝚂𝙴𝚁: @${senderNumber}*\n`;
        menuText += `*┃🐢│ 𝙿𝚁𝙴𝙵𝙸𝚇: ${prefix || config.PREFIX}*\n`;
        menuText += `*┃🐢│ 𝚄𝙿𝚃𝙸𝙼𝙴: ${systemInfo.uptime}*\n`;
        menuText += `*┃🐢│ 𝙼𝙴𝙼𝙾𝚁𝚈: ${systemInfo.memory.used}*\n`;
        menuText += `*┃🐢│ 𝙲𝙼𝙳𝚂: ${totalCommands}*\n`;
        menuText += `*╰━━━━━━━━━━━━━━━┈⊷*\n\n`;

        // Add categories
        for (const [category, cmds] of Object.entries(categories)) {
            menuText += `*╭━━━〔 🐢 ${category.toUpperCase()} 〕━━━┈⊷*\n`;
            cmds.forEach(cmd => {
                menuText += `*┃🐢│ ❮✦❯ ${cmd}*\n`;
            });
            menuText += `*╰━━━━━━━━━━━━━━━┈⊷*\n\n`;
        }

        menuText += `${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: botImage },
            caption: menuText,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Menu command error:', error);
        await conn.sendMessage(from, {
            text: `❌ Error: ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
