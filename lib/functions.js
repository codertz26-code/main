const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const Jimp = require('jimp');
const crypto = require('crypto');
const os = require('os');
const config = require('../config');

// ============================================
// 📌 FAKE VCARD (Global)
// ============================================
const fkontak = {
    "key": {
        "participant": '0@s.whatsapp.net',
        "remoteJid": '0@s.whatsapp.net',
        "fromMe": false,
        "id": "Halo"
    },
    "message": {
        "conversation": "𝚂𝙸𝙻𝙰"
    }
};

// ============================================
// 📌 CONTEXT INFO GENERATOR
// ============================================
const getContextInfo = (m, ownerName = config.OWNER_NAME, formattedOwnerNumber = config.OWNER_NUMBER) => {
    return {
        mentionedJid: m.mentionedJid || [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402325089913@newsletter',
            newsletterName: `© ${config.BOT_NAME}`,
            serverMessageId: 143,
        },
        externalAdReply: {
            title: `👑 𝙱𝙾𝚃 𝙾𝚆𝙽𝙴𝚁: ${ownerName}`,
            body: `📞 wa.me/${formattedOwnerNumber}`,
            mediaType: 1,
            previewType: 0,
            thumbnailUrl: config.BOT_IMAGES[0],
            sourceUrl: `https://wa.me/${formattedOwnerNumber}`,
            renderLargerThumbnail: false,
        }
    };
};

// ============================================
// 📌 FORMAT MESSAGE WITH BUTTONS
// ============================================
const formatMessageWithButtons = (text, buttons) => {
    return {
        text: text,
        buttons: buttons,
        viewOnce: true,
        headerType: 1
    };
};

// ============================================
// 📌 CREATE BUTTON MESSAGE
// ============================================
const createButtonMessage = (text, buttonList) => {
    const buttons = buttonList.map(btn => ({
        buttonId: btn.id,
        buttonText: { displayText: btn.text },
        type: 1
    }));
    
    return {
        text: text,
        buttons: buttons,
        viewOnce: true,
        headerType: 1
    };
};

// ============================================
// 📌 FORMAT BYTES
// ============================================
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// ============================================
// 📌 GET SYSTEM INFO
// ============================================
const getSystemInfo = () => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const memory = process.memoryUsage();
    const memoryUsed = formatBytes(memory.heapUsed);
    const memoryTotal = formatBytes(memory.heapTotal);
    
    return {
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        memory: {
            used: memoryUsed,
            total: memoryTotal,
            rss: formatBytes(memory.rss)
        },
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        hostname: os.hostname()
    };
};

// ============================================
// 📌 GET TIMESTAMP (East Africa Time)
// ============================================
const getTimestamp = () => {
    return moment().tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss');
};

// ============================================
// 📌 GENERATE RANDOM STRING
// ============================================
const generateRandomString = (length = 10) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// ============================================
// 📌 SLEEP FUNCTION
// ============================================
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// �UPLOAD TO CATBOX
// ============================================
const uploadToCatbox = async (buffer, filename) => {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('fileToUpload', buffer, filename);
    form.append('reqtype', 'fileupload');
    
    const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders()
    });
    
    return res.data;
};

// ============================================
// 📌 FETCH NEWSLETTER JIDS FROM GITHUB
// ============================================
const fetchNewsletterJIDs = async () => {
    try {
        const res = await axios.get(config.NEWSLETTER_JIDS_URL, {
            timeout: 10000
        });
        return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
        console.error('❌ Failed to fetch newsletter JIDs:', err.message);
        return config.CHANNEL_JIDS || [];
    }
};

// ============================================
// 📌 CHECK IF USER IS GROUP ADMIN
// ============================================
const isGroupAdmin = async (socket, jid, user) => {
    try {
        const groupMetadata = await socket.groupMetadata(jid);
        const participant = groupMetadata.participants.find(p => p.id === user);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin' || false;
    } catch (error) {
        return false;
    }
};

// ============================================
// 📌 CHECK IF USER IS BOT OWNER
// ============================================
const isBotOwner = (userId, ownerNumber) => {
    const cleanUserId = userId.split('@')[0].replace(/[^0-9]/g, '');
    const cleanOwner = ownerNumber.replace(/[^0-9]/g, '');
    return cleanUserId === cleanOwner;
};

// ============================================
// 📌 EXTRACT URLS FROM TEXT
// ============================================
const extractUrls = (text) => {
    const urls = [];
    for (const pattern of config.URL_PATTERNS) {
        const matches = text.match(pattern);
        if (matches) {
            urls.push(...matches);
        }
    }
    return [...new Set(urls)]; // Remove duplicates
};

// ============================================
// 📌 GET RANDOM ITEM FROM ARRAY
// ============================================
const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

// ============================================
// 📌 FORMAT NUMBER WITH COMMAS
// ============================================
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

module.exports = {
    fkontak,
    getContextInfo,
    formatMessageWithButtons,
    createButtonMessage,
    formatBytes,
    getSystemInfo,
    getTimestamp,
    generateRandomString,
    sleep,
    uploadToCatbox,
    fetchNewsletterJIDs,
    isGroupAdmin,
    isBotOwner,
    extractUrls,
    getRandomItem,
    formatNumber
};
