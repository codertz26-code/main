module.exports = {
    // ============================================
    // 📌 BOT CONFIGURATION
    // ============================================
    BOT_NAME: '𝚂𝙸𝙻𝙰 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃',
    BOT_VERSION: '2.0.0',
    BOT_FOOTER: '> © 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 🐢 𝚂𝙸𝙻𝙰 𝙼𝙳',
    
    // ============================================
    // 📌 OWNER INFO
    // ============================================
    OWNER_NUMBER: '255612491554',
    OWNER_NAME: '𝐒𝐈𝐋𝐀 𝐓𝐄𝐂𝐇',
    
    // ============================================
    // 📌 MONGODB CONNECTION
    // ============================================
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://sila_md:sila0022@sila.67mxtd7.mongodb.net/',
    
    // ============================================
    // 📌 PREFIX & COMMANDS
    // ============================================
    PREFIX: '.',
    NO_PREFIX: 'true', // Allow commands without prefix
    
    // ============================================
    // 📌 AUTO FEATURES
    // ============================================
    AUTO_RECORDING: 'false',
    AUTO_TYPING: 'true',
    ANTI_CALL: 'false',
    WELCOME_ENABLE: 'true',
    GOODBYE_ENABLE: 'true',
    READ_MESSAGE: 'true',
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    WORK_TYPE: 'public',
    ANTI_LINK: 'true',
    AUTO_AI: 'on',
    AUTO_STICKER: 'off',
    AUTO_VOICE: 'off',
    ST_EMOJI: '🐢',
    
    // ============================================
    // 📌 AUTO LIKE EMOJIS
    // ============================================
    AUTO_LIKE_EMOJI: ['💋', '😶', '✨️', '💗', '🎈', '🎉', '🥳', '❤️', '🧫', '🐢'],
    
    // ============================================
    // 📌 NEWSLETTER JIDS FROM GITHUB
    // ============================================
    NEWSLETTER_JIDS_URL: 'https://raw.githubusercontent.com/mbwa-md/jid/refs/heads/main/newsletter_list.json',
    
    // ============================================
    // 📌 AUTO JOIN GROUPS & CHANNELS
    // ============================================
    AUTO_JOIN_LINKS: [
        'https://whatsapp.com/channel/0029VbBPxQTJUM2WCZLB6j28', // MAIN
        'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02', // STB
        'https://whatsapp.com/channel/0029VbBmFT430LKO7Ch9C80X', // LOGO
        'https://chat.whatsapp.com/IdGNaKt80DEBqirc2ek4ks', // BOT.USER
        'https://chat.whatsapp.com/C03aOCLQeRUH821jWqRPC6' // SILATECH
    ],
    
    // ============================================
    // 📌 CHANNEL JIDS FOR AUTO REACTION
    // ============================================
    CHANNEL_JIDS: [
        '120363402325089913@newsletter',
        '120363421404091643@newsletter'
    ],
    
    // ============================================
    // 📌 BOT IMAGES
    // ============================================
    BOT_IMAGES: [
        'https://files.catbox.moe/277zt9.jpg',
        'https://files.catbox.moe/277zt9.jpg'
    ],
    
    // ============================================
    // 📌 URL PATTERNS FOR ANTI-LINK
    // ============================================
    URL_PATTERNS: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
        /chat\.whatsapp\.com\/[a-zA-Z0-9]+/gi,
        /whatsapp\.com\/channel\/[a-zA-Z0-9]+/gi,
        /t\.me\/[a-zA-Z0-9_]+/gi,
        /telegram\.me\/[a-zA-Z0-9_]+/gi,
        /instagram\.com\/[a-zA-Z0-9_.]+/gi,
        /facebook\.com\/[a-zA-Z0-9_.]+/gi,
        /twitter\.com\/[a-zA-Z0-9_]+/gi,
        /youtube\.com\/[a-zA-Z0-9_]+/gi,
        /tiktok\.com\/@[a-zA-Z0-9_.]+/gi,
        /snapchat\.com\/add\/[a-zA-Z0-9_.]+/gi,
        /discord\.gg\/[a-zA-Z0-9]+/gi,
        /discord\.com\/invite\/[a-zA-Z0-9]+/gi
    ],
    
    // ============================================
    // 📌 AUTO-REPLY MESSAGES
    // ============================================
    autoReplies: {
        'hi': '𝙷𝚎𝚕𝚕𝚘! 👋 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚑𝚎𝚕𝚙 𝚢𝚘𝚞 𝚝𝚘𝚍𝚊𝚢?',
        'mambo': '𝙿𝚘𝚊 𝚜𝚊𝚗𝚊! 👋 𝙽𝚒𝚔𝚞𝚜𝚊𝚒𝚍𝚒𝚎 𝙺𝚞𝚑𝚞𝚜𝚞?',
        'hey': '𝙷𝚎𝚢 𝚝𝚑𝚎𝚛𝚎! 😊 𝚄𝚜𝚎 .𝚖𝚎𝚗𝚞 𝚝𝚘 𝚜𝚎𝚎 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.',
        'vip': '𝙷𝚎𝚕𝚕𝚘 𝚅𝙸𝙿! 👑 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚊𝚜𝚜𝚒𝚜𝚝 𝚢𝚘𝚞?',
        'mkuu': '𝙷𝚎𝚢 𝚖𝚔𝚞𝚞! 👋 𝙽𝚒𝚔𝚞𝚜𝚊𝚒𝚍𝚒𝚎 𝙺𝚞𝚑𝚞𝚜𝚞?',
        'boss': '𝚈𝚎𝚜 𝚋𝚘𝚜𝚜! 👑 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚑𝚎𝚕𝚙 𝚢𝚘𝚞?',
        'habari': '𝙽𝚣𝚞𝚛𝚒 𝚜𝚊𝚗𝚊! 👋 𝙷𝚊𝚋𝚊𝚛𝚒 𝚢𝚊𝚔𝚘?',
        'hello': '𝙷𝚒 𝚝𝚑𝚎𝚛𝚎! 😊 𝚄𝚜𝚎 .𝚖𝚎𝚗𝚞 𝚝𝚘 𝚜𝚎𝚎 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.',
        'bot': '𝚈𝚎𝚜, 𝙸 𝚊𝚖 𝚂𝙸𝙻𝙰 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃! 🤖 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚊𝚜𝚜𝚒𝚜𝚝 𝚢𝚘𝚞?',
        'menu': '𝚃𝚢𝚙𝚎 .𝚖𝚎𝚗𝚞 𝚝𝚘 𝚜𝚎𝚎 𝚊𝚕𝚕 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜! 📜',
        'owner': '𝙲𝚘𝚗𝚝𝚊𝚌𝚝 𝚘𝚠𝚗𝚎𝚛 𝚞𝚜𝚒𝚗𝚐 .𝚘𝚠𝚗𝚎𝚛 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 👑',
        'thanks': '𝚈𝚘𝚞\'𝚛𝚎 𝚠𝚎𝚕𝚌𝚘𝚖𝚎! 😊',
        'thank you': '𝙰𝚗𝚢𝚝𝚒𝚖𝚎! 𝙻𝚎𝚝 𝚖𝚎 𝚔𝚗𝚘𝚠 𝚒𝚏 𝚢𝚘𝚞 𝚗𝚎𝚎𝚍 𝚑𝚎𝚕𝚙 🤖'
    }
};
