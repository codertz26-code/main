const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, getRandomItem } = require('../lib/functions');
const { saveSettings } = require('../lib/database');

cmd({
    pattern: "chatbot",
    alias: ["ai", "autochat"],
    desc: "Toggle AI Chatbot feature",
    category: "owner",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isOwner }) => {
    try {
        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: "🚫 *𝙾𝚠𝚗𝚎𝚛-𝚘𝚗𝚕𝚢 𝚌𝚘𝚖𝚖𝚊𝚗𝚍!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        
        if (action === 'on') {
            config.AUTO_AI = 'on';
            await saveSettings(sender.split('@')[0], { AUTO_AI: 'on' });
            
            // Send with buttons
            const buttons = [
                { id: '.menu', text: '📜 MENU' },
                { id: '.ping', text: '🏓 PING' },
                { id: '.owner', text: '👑 OWNER' }
            ];
            
            await conn.sendMessage(from, {
                text: `✅ *𝙲𝚑𝚊𝚝𝚋𝚘𝚝 𝙴𝙽𝙰𝙱𝙻𝙴𝙳!*\n\n𝙸 𝚠𝚒𝚕𝚕 𝚗𝚘𝚠 𝚛𝚎𝚜𝚙𝚘𝚗𝚍 𝚝𝚘 𝚊𝚕𝚕 𝚖𝚎𝚜𝚜𝚊𝚐𝚎𝚜 𝚒𝚗 𝙿𝚅 𝚊𝚗𝚍 𝙶𝚛𝚘𝚞𝚙𝚜 🤖`,
                buttons: buttons.map(btn => ({
                    buttonId: btn.id,
                    buttonText: { displayText: btn.text },
                    type: 1
                })),
                viewOnce: true,
                headerType: 1,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            
        } else if (action === 'off') {
            config.AUTO_AI = 'off';
            await saveSettings(sender.split('@')[0], { AUTO_AI: 'off' });
            
            await conn.sendMessage(from, {
                text: `❌ *𝙲𝚑𝚊𝚝𝚋𝚘𝚝 𝙳𝙸𝚂𝙰𝙱𝙻𝙴𝙳!*\n\n𝙸 𝚠𝚒𝚕𝚕 𝚗𝚘𝚝 𝚛𝚎𝚜𝚙𝚘𝚗𝚍 𝚝𝚘 𝚖𝚎𝚜𝚜𝚊𝚐𝚎𝚜 𝚊𝚞𝚝𝚘𝚖𝚊𝚝𝚒𝚌𝚊𝚕𝚕𝚢.`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            
        } else {
            const status = config.AUTO_AI === 'on' ? '✅ *ENABLED*' : '❌ *DISABLED*';
            
            const buttons = [
                { id: '.chatbot on', text: '✅ ON' },
                { id: '.chatbot off', text: '❌ OFF' },
                { id: '.menu', text: '📜 MENU' }
            ];
            
            await conn.sendMessage(from, {
                text: `🤖 *Chatbot Status:* ${status}\n\nChoose an option below:`,
                buttons: buttons.map(btn => ({
                    buttonId: btn.id,
                    buttonText: { displayText: btn.text },
                    type: 1
                })),
                viewOnce: true,
                headerType: 1,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

    } catch (error) {
        console.error("Chatbot command error:", error);
        await conn.sendMessage(from, {
            text: `⚠️ Error: ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
