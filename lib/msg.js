const { getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const config = require('../config');

// ============================================
// 📌 MESSAGE PROCESSOR (sms function)
// ============================================
const sms = (conn, m, store) => {
    if (!m) return m;
    
    if (m.key) {
        m.id = m.key.id;
        m.isBot = m.id.startsWith('BAES') && m.id.length === 16;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.fromMe ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : 
                   m.isGroup ? m.key.participant : m.key.remoteJid;
    }
    
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype == 'viewOnceMessage' ? 
                m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : 
                m.message[m.mtype]);
        
        try {
            m.body = (m.mtype === 'conversation') ? m.message.conversation : 
                     (m.mtype == 'imageMessage' && m.message.imageMessage.caption) ? m.message.imageMessage.caption : 
                     (m.mtype == 'videoMessage' && m.message.videoMessage.caption) ? m.message.videoMessage.caption : 
                     (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
                     (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : '';
        } catch {
            m.body = false;
        }
        
        let quoted = (m.quoted = m.msg?.contextInfo ? m.msg.contextInfo.quotedMessage : null);
        m.mentionedJid = m.msg?.contextInfo ? m.msg.contextInfo.mentionedJid : [];
        
        if (m.quoted) {
            let type = getContentType(quoted);
            m.quoted = m.quoted[type];
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted);
                m.quoted = m.quoted[type];
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted };
            
            // Add quoted sender
            m.quoted.sender = m.msg?.contextInfo?.participant || m.sender;
            m.quoted.fromMe = m.quoted.sender === conn.user.id;
            
            // Add quoted message type
            m.quoted.mtype = type;
            
            // Add quoted message content
            if (m.quoted.conversation) m.quoted.text = m.quoted.conversation;
            if (m.quoted.extendedTextMessage?.text) m.quoted.text = m.quoted.extendedTextMessage.text;
            if (m.quoted.imageMessage?.caption) m.quoted.text = m.quoted.imageMessage.caption;
            if (m.quoted.videoMessage?.caption) m.quoted.text = m.quoted.videoMessage.caption;
        }
    }
    
    return m;
};

// ============================================
// 📌 DOWNLOAD MEDIA MESSAGE
// ============================================
const downloadMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    
    if (filename) {
        const FileType = require('file-type');
        let type = await FileType.fromBuffer(buffer);
        let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
        await require('fs-extra').writeFile(trueFileName, buffer);
        return trueFileName;
    }
    
    return buffer;
};

// ============================================
// 📌 GET QUOTED TEXT
// ============================================
const getQuotedText = (quotedMessage) => {
    if (!quotedMessage) return '';

    if (quotedMessage.conversation) return quotedMessage.conversation;
    if (quotedMessage.extendedTextMessage?.text) return quotedMessage.extendedTextMessage.text;
    if (quotedMessage.imageMessage?.caption) return quotedMessage.imageMessage.caption;
    if (quotedMessage.videoMessage?.caption) return quotedMessage.videoMessage.caption;
    if (quotedMessage.buttonsMessage?.contentText) return quotedMessage.buttonsMessage.contentText;
    if (quotedMessage.listMessage?.description) return quotedMessage.listMessage.description;
    if (quotedMessage.listMessage?.title) return quotedMessage.listMessage.title;
    if (quotedMessage.listResponseMessage?.singleSelectReply?.selectedRowId) return quotedMessage.listResponseMessage.singleSelectReply.selectedRowId;
    if (quotedMessage.templateButtonReplyMessage?.selectedId) return quotedMessage.templateButtonReplyMessage.selectedId;
    if (quotedMessage.reactionMessage?.text) return quotedMessage.reactionMessage.text;

    if (quotedMessage.viewOnceMessage) {
        const inner = quotedMessage.viewOnceMessage.message;
        if (inner?.imageMessage?.caption) return inner.imageMessage.caption;
        if (inner?.videoMessage?.caption) return inner.videoMessage.caption;
        if (inner?.imageMessage) return '[view once image]';
        if (inner?.videoMessage) return '[view once video]';
    }

    if (quotedMessage.stickerMessage) return '[sticker]';
    if (quotedMessage.audioMessage) return '[audio]';
    if (quotedMessage.documentMessage?.fileName) return quotedMessage.documentMessage.fileName;
    if (quotedMessage.contactMessage?.displayName) return quotedMessage.contactMessage.displayName;

    return '';
};

// ============================================
// 📌 CREATE REPLY FUNCTION
// ============================================
const createReply = (conn, from, text, quoted = null, contextInfo = {}) => {
    return conn.sendMessage(from, { 
        text: text,
        contextInfo: contextInfo
    }, { quoted: quoted });
};

// ============================================
// 📌 CREATE REACTION FUNCTION
// ============================================
const createReaction = (conn, from, emoji, key) => {
    return conn.sendMessage(from, { 
        react: { 
            text: emoji, 
            key: key 
        }
    });
};

// ============================================
// 📌 CREATE IMAGE MESSAGE
// ============================================
const createImageMessage = (conn, from, image, caption = '', quoted = null, contextInfo = {}) => {
    return conn.sendMessage(from, { 
        image: image, 
        caption: caption,
        contextInfo: contextInfo
    }, { quoted: quoted });
};

// ============================================
// 📌 CREATE VIDEO MESSAGE
// ============================================
const createVideoMessage = (conn, from, video, caption = '', quoted = null, contextInfo = {}) => {
    return conn.sendMessage(from, { 
        video: video, 
        caption: caption,
        contextInfo: contextInfo
    }, { quoted: quoted });
};

// ============================================
// 📌 CREATE AUDIO MESSAGE
// ============================================
const createAudioMessage = (conn, from, audio, mimetype = 'audio/mp4', ptt = false, quoted = null, contextInfo = {}) => {
    return conn.sendMessage(from, { 
        audio: audio, 
        mimetype: mimetype,
        ptt: ptt,
        contextInfo: contextInfo
    }, { quoted: quoted });
};

// ============================================
// 📌 CREATE STICKER MESSAGE
// ============================================
const createStickerMessage = (conn, from, sticker, quoted = null, contextInfo = {}) => {
    return conn.sendMessage(from, { 
        sticker: sticker,
        contextInfo: contextInfo
    }, { quoted: quoted });
};

// ============================================
// 📌 CREATE DOCUMENT MESSAGE
// ============================================
const createDocumentMessage = (conn, from, document, mimetype, fileName, quoted = null, contextInfo = {}) => {
    return conn.sendMessage(from, { 
        document: document,
        mimetype: mimetype,
        fileName: fileName,
        contextInfo: contextInfo
    }, { quoted: quoted });
};

// ============================================
// 📌 CREATE BUTTON MESSAGE
// ============================================
const createButtonMessage = (conn, from, text, buttons, quoted = null, contextInfo = {}) => {
    return conn.sendMessage(from, {
        text: text,
        buttons: buttons.map(btn => ({
            buttonId: btn.id,
            buttonText: { displayText: btn.text },
            type: 1
        })),
        viewOnce: true,
        headerType: 1,
        contextInfo: contextInfo
    }, { quoted: quoted });
};

// ============================================
// 📌 CREATE LIST MESSAGE
// ============================================
const createListMessage = (conn, from, text, buttonText, sections, quoted = null, contextInfo = {}) => {
    return conn.sendMessage(from, {
        text: text,
        footer: config.BOT_FOOTER,
        title: config.BOT_NAME,
        buttonText: buttonText,
        sections: sections,
        viewOnce: true,
        contextInfo: contextInfo
    }, { quoted: quoted });
};

module.exports = {
    sms,
    downloadMediaMessage,
    getQuotedText,
    createReply,
    createReaction,
    createImageMessage,
    createVideoMessage,
    createAudioMessage,
    createStickerMessage,
    createDocumentMessage,
    createButtonMessage,
    createListMessage
};
