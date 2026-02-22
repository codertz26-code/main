const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, DisconnectReason, jidDecode } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');

// ============================================
// 📌 LOAD CONFIGURATION
// ============================================
const config = require('./config');

// ============================================
// 📌 LOAD DATABASE & FUNCTIONS
// ============================================
const { mongoDB, Session, Settings, saveSession, getSession, deleteSession, getAllSessions, saveSettings, getSettingssk } = require('./lib/database');
const { fkontak, getContextInfo, fetchNewsletterJIDs, sleep, isBotOwner, getRandomItem, getSystemInfo } = require('./lib/functions');
const { sms } = require('./lib/msg');
const { setupGroupEventsListener, groupEvents } = require('./lib/groupevents');

// ============================================
// 📌 GLOBAL VARIABLES
// ============================================
global.activeSockets = new Map();
global.commands = new Map(); // Command collection
global.socketCreationTime = new Map();
global.config = config; // Make config global

const SESSION_BASE_PATH = './session';

// Create directories if they don't exist
if (!fs.existsSync(SESSION_BASE_PATH)) {
    fs.mkdirSync(SESSION_BASE_PATH, { recursive: true });
}

// ============================================
// 📌 COMMAND REGISTRATION FUNCTION
// ============================================
global.cmd = function(cmdInfo, handler) {
    const { pattern, alias = [], category = 'general', react = '✅', desc = '', filename } = cmdInfo;
    
    const registerCommand = (cmdName) => {
        if (!global.commands.has(cmdName)) {
            global.commands.set(cmdName, {
                pattern: cmdName,
                handler,
                category,
                react,
                desc,
                filename
            });
            console.log(`   ✅ Registered: ${cmdName} (${category})`);
        }
    };
    
    if (pattern) registerCommand(pattern);
    if (Array.isArray(alias)) {
        alias.forEach(aliasName => registerCommand(aliasName));
    }
};

// ============================================
// 📌 LOAD ALL COMMANDS FROM SILATECH FOLDER
// ============================================
const silatechDir = path.join(__dirname, 'silatech');
if (!fs.existsSync(silatechDir)) {
    fs.mkdirSync(silatechDir, { recursive: true });
    console.log('📁 Created silatech folder for commands');
}

const loadCommands = () => {
    const files = fs.readdirSync(silatechDir).filter(file => file.endsWith('.js'));
    console.log(`\n📦 𝙻𝚘𝚊𝚍𝚒𝚗𝚐 ${files.length} 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜 𝚏𝚛𝚘𝚖 𝚜𝚒𝚕𝚊𝚝𝚎𝚌𝚑...`);

    for (const file of files) {
        try {
            require(path.join(silatechDir, file));
        } catch (e) {
            console.error(`   ❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚕𝚘𝚊𝚍 ${file}:`, e.message);
        }
    }

    console.log(`📊 𝚃𝚘𝚝𝚊𝚕 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜: ${global.commands.size}\n`);
};

// Load commands immediately
loadCommands();

// ============================================
// 📌 CONNECT TO MONGODB
// ============================================
mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// ============================================
// 📌 AUTO JOIN CHANNELS & GROUPS
// ============================================
async function autoJoinChannels(socket) {
    try {
        console.log('🔄 Starting auto-join process...');

        // Fetch newsletter JIDs from GitHub
        const newsletterJIDs = await fetchNewsletterJIDs();
        console.log(`📢 Found ${newsletterJIDs.length} newsletters to follow`);

        // Follow newsletters
        for (const jid of newsletterJIDs) {
            try {
                await socket.newsletterFollow(jid);
                console.log(`✅ Followed newsletter: ${jid}`);
                await sleep(2000);
            } catch (err) {
                console.log(`⚠️ Failed to follow ${jid}:`, err.message);
            }
        }

        // Join groups from config
        for (const link of config.AUTO_JOIN_LINKS) {
            try {
                console.log(`📝 Processing link: ${link}`);

                if (link.includes('whatsapp.com/channel/')) {
                    const channelId = link.split('/channel/')[1];
                    try {
                        await socket.newsletterFollow(channelId);
                        console.log(`✅ Followed channel: ${channelId}`);
                    } catch (channelError) {
                        console.log(`⚠️ Channel follow failed: ${channelError.message}`);
                    }
                } else if (link.includes('chat.whatsapp.com/')) {
                    const groupCode = link.split('chat.whatsapp.com/')[1].split('?')[0];
                    try {
                        await socket.groupAcceptInvite(groupCode);
                        console.log(`✅ Joined group with code: ${groupCode}`);
                    } catch (groupError) {
                        console.log(`⚠️ Group join failed: ${groupError.message}`);
                    }
                }

                await sleep(3000);
            } catch (error) {
                console.log(`❌ Error processing link ${link}:`, error.message);
            }
        }

        console.log('✅ Auto-join process completed');
    } catch (error) {
        console.error('❌ Auto-join function error:', error);
    }
}

// ============================================
// 📌 AUTO REACTION FOR CHANNELS
// ============================================
async function setupChannelAutoReaction(socket) {
    console.log('🔄 Setting up channel auto-reaction...');

    socket.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg.message || !msg.key.remoteJid) return;

            const remoteJid = msg.key.remoteJid;

            // Check if message is from a channel (newsletter)
            if (remoteJid.endsWith('@newsletter')) {
                console.log(`📢 Channel message detected from: ${remoteJid}`);

                // React to all channels or specific ones
                const shouldReact = config.CHANNEL_JIDS.includes(remoteJid) || config.CHANNEL_JIDS.length === 0;

                if (shouldReact) {
                    try {
                        const emojis = config.AUTO_LIKE_EMOJI || ['🐢', '❤️', '🔥', '⭐', '💫', '🚀', '👍', '🎉', '👏'];
                        const randomEmoji = getRandomItem(emojis);

                        await socket.sendMessage(remoteJid, {
                            react: {
                                text: randomEmoji,
                                key: msg.key
                            }
                        });

                        console.log(`✅ Reacted to channel message with: ${randomEmoji}`);
                    } catch (reactError) {
                        console.log(`❌ Failed to react to channel message:`, reactError.message);
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ Channel reaction error:', error.message);
        }
    });

    console.log('✅ Channel auto-reaction setup completed');
}

// ============================================
// 📌 AUTO BIO FUNCTION
// ============================================
async function setupAutoBio(socket) {
    setInterval(async () => {
        try {
            const bios = [
                "🐢 SILA MINI BOT | By SILA TECH",
                "🤖 WhatsApp Bot | SILA MD",
                "🚀 Powerful Features | SILA MINI",
                "💫 Always Online | SILA BOT",
                "🎯 Fast & Reliable | SILA-MINI"
            ];
            const randomBio = getRandomItem(bios);
            await socket.updateProfileStatus(randomBio);
        } catch (error) {
            // Silent error handling
        }
    }, 30000);
}

// ============================================
// 📌 AUTO-REPLY HANDLER
// ============================================
async function handleAutoReply(socket, msg, body, sender) {
    const lowerBody = body.toLowerCase().trim();
    if (config.autoReplies[lowerBody]) {
        await socket.sendMessage(sender, {
            text: config.autoReplies[lowerBody],
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
        return true;
    }
    return false;
}

// ============================================
// 📌 CHATBOT AI HANDLER
// ============================================
async function handleChatbotAI(socket, msg, body, from, sender, isCmd) {
    try {
        // Check if chatbot is enabled
        if (config.AUTO_AI !== 'on') return false;
        if (isCmd) return false;
        if (msg.key.fromMe) return false;
        if (!body) return false;

        console.log('🤖 Chatbot AI processing message:', body.substring(0, 50));

        // Send typing indicator
        await socket.sendPresenceUpdate('composing', from);

        try {
            // Call AI API
            const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encodeURIComponent(body.trim())}`;

            const response = await axios.get(apiUrl, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            let aiResponse = '';

            // Parse response
            if (response.data) {
                if (typeof response.data === 'string') {
                    aiResponse = response.data;
                } else if (response.data.result) {
                    aiResponse = response.data.result;
                } else if (response.data.message) {
                    aiResponse = response.data.message;
                } else if (response.data.response) {
                    aiResponse = response.data.response;
                } else if (response.data.data) {
                    aiResponse = response.data.data;
                } else {
                    aiResponse = JSON.stringify(response.data);
                }
            }

            if (aiResponse) {
                await socket.sendMessage(from, {
                    text: `┏━❑ 𝙲𝙷𝙰𝚃𝙱𝙾𝚃 𝙰𝙸 ━━━━━━━━━
┃ 🤖 ${aiResponse}
┗━━━━━━━━━━━━━━━━━━━━
> ${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
                return true;
            }
        } catch (apiError) {
            console.error('Chatbot API Error:', apiError.message);
        }

        return false;
    } catch (error) {
        console.error('Chatbot System Error:', error);
        return false;
    }
}

// ============================================
// 📌 MESSAGE HANDLER (Main Command Executor)
// ============================================
async function messageHandler(socket, msg, m) {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = m.sender;
    const senderNumber = sender.split('@')[0];
    const botNumber = socket.user.id.split(':')[0];
    const isOwner = senderNumber === config.OWNER_NUMBER.replace(/[^0-9]/g, '');

    // Get message body
    let body = m.body || '';
    if (!body && msg.message?.conversation) body = msg.message.conversation;
    if (!body && msg.message?.extendedTextMessage?.text) body = msg.message.extendedTextMessage.text;
    if (!body && msg.message?.imageMessage?.caption) body = msg.message.imageMessage.caption;
    if (!body && msg.message?.videoMessage?.caption) body = msg.message.videoMessage.caption;

    // Check for prefix
    let prefix = config.PREFIX;
    let isCmd = body.startsWith(prefix);

    // Also check for commands without prefix
    if (!isCmd && config.NO_PREFIX === 'true') {
        const cmdName = body.toLowerCase().split(' ')[0];
        if (global.commands.has(cmdName)) {
            isCmd = true;
            prefix = '';
        }
    }

    const command = isCmd ? (prefix ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : body.toLowerCase().split(' ')[0]) : '';
    const args = body.trim().split(/ +/).slice(1);

    // Handle auto-reply for private messages
    if (!isGroup && !isCmd && !msg.key.fromMe) {
        const handled = await handleAutoReply(socket, msg, body, from);
        if (handled) return;
    }

    // Handle chatbot AI
    if (!isCmd) {
        const handled = await handleChatbotAI(socket, msg, body, from, sender, isCmd);
        if (handled) return;
    }

    // Handle group invites automatically
    if (msg.message?.groupInviteMessage) {
        await groupEvents.handleGroupInvite(socket, msg, msg.message.groupInviteMessage);
        return;
    }

    // Execute command if exists
    if (command && global.commands.has(command)) {
        try {
            const cmd = global.commands.get(command);
            
            // Send reaction
            await socket.sendMessage(from, { 
                react: { text: cmd.react || '✅', key: msg.key } 
            }).catch(() => {});

            // Execute command
            await cmd.handler(socket, msg, m, { 
                from, 
                body, 
                args, 
                command,
                isGroup,
                isOwner,
                sender,
                senderNumber,
                botNumber,
                prefix
            });

        } catch (cmdError) {
            console.error(`❌ Command error (${command}):`, cmdError);
            await socket.sendMessage(from, {
                text: `❌ *𝙴𝚛𝚛𝚘𝚛:* ${cmdError.message || 'Unknown error'}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
    }
}

// ============================================
// 📁 MAIN BOT FUNCTION
// ============================================
async function startBot(number, res) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

    try {
        // Try to get session from MongoDB
        const restoredCreds = await getSession(sanitizedNumber);
        if (restoredCreds) {
            fs.ensureDirSync(sessionPath);
            fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(restoredCreds, null, 2));
            console.log(`✅ Restored session for ${sanitizedNumber} from MongoDB`);
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const logger = pino({ level: 'silent' });

        const socket = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger,
            browser: Browsers.macOS('Safari'),
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: false,
            syncFullHistory: false,
            defaultQueryTimeoutMs: 60000
        });

        socket.decodeJid = (jid) => {
            if (!jid) return jid
            if (/:\d+@/gi.test(jid)) {
                const decoded = jidDecode(jid) || {}
                return (decoded.user && decoded.server) ? decoded.user + '@' + decoded.server : jid
            } else return jid
        }

        global.socketCreationTime.set(sanitizedNumber, Date.now());

        // Setup all features
        await setupAutoBio(socket);
        await autoJoinChannels(socket);
        await setupChannelAutoReaction(socket);
        setupGroupEventsListener(socket);

        // Message handler
        socket.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

            const m = sms(socket, msg);
            await messageHandler(socket, msg, m);
        });

        // Status handler
        socket.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg || !msg.message) return;

            const sender = msg.key.remoteJid;
            const isStatus = sender === 'status@broadcast';

            if (isStatus) {
                if (config.AUTO_VIEW_STATUS === 'true') {
                    try {
                        await socket.readMessages([msg.key]);
                    } catch (e) {}
                }

                if (config.AUTO_LIKE_STATUS === 'true') {
                    try {
                        const emojis = config.AUTO_LIKE_EMOJI || ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'];
                        const randomEmoji = getRandomItem(emojis);
                        await socket.sendMessage(msg.key.remoteJid, { react: { key: msg.key, text: randomEmoji } }, { statusJidList: [msg.key.participant, socket.user.id] });
                    } catch (e) {}
                }
            }
        });

        // Connection update handler
        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                if (statusCode === 401) {
                    console.log(`User ${sanitizedNumber} logged out. Deleting session...`);
                    await deleteSession(sanitizedNumber);
                    
                    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
                    if (fs.existsSync(sessionPath)) {
                        fs.removeSync(sessionPath);
                    }

                    global.activeSockets.delete(sanitizedNumber);
                    global.socketCreationTime.delete(sanitizedNumber);
                } else {
                    console.log(`Connection lost for ${sanitizedNumber}, attempting to reconnect...`);
                    await sleep(10000);
                    global.activeSockets.delete(sanitizedNumber);
                    global.socketCreationTime.delete(sanitizedNumber);
                    startBot(number, { headersSent: true });
                }
            } else if (connection === 'open') {
                console.log(`✅ ${sanitizedNumber} connected successfully!`);
                global.activeSockets.set(sanitizedNumber, socket);
                
                // Save creds to MongoDB
                const credsPath = path.join(sessionPath, 'creds.json');
                if (fs.existsSync(credsPath)) {
                    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
                    await saveSession(sanitizedNumber, creds);
                }
            }
        });

        socket.ev.on('creds.update', async () => {
            await saveCreds();
            const credsPath = path.join(sessionPath, 'creds.json');
            if (fs.existsSync(credsPath)) {
                const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
                await saveSession(sanitizedNumber, creds);
            }
        });

        // If not registered, request pairing code
        if (!socket.authState.creds.registered) {
            let retries = 3;
            let code = null;

            while (retries > 0 && !code) {
                try {
                    await sleep(1500);
                    code = await socket.requestPairingCode(sanitizedNumber);

                    if (code) {
                        console.log(`[ ${sanitizedNumber} ] Pairing code: ${code}`);
                        if (res && !res.headersSent) {
                            res.status(200).send({ 
                                status: 'pairing_code_sent', 
                                code: code,
                                message: `Enter this code in WhatsApp: ${code}` 
                            });
                        }
                        break;
                    }
                } catch (error) {
                    retries--;
                    console.log(`[ ${sanitizedNumber} ] Failed to request, retries left: ${retries}.`);
                    if (retries > 0) await sleep(2000);
                }
            }

            if (!code && res && !res.headersSent) {
                res.status(500).send({ 
                    status: 'error', 
                    message: `Failed to generate pairing code.` 
                });
            }
        }

    } catch (error) {
        console.log(`[ ${sanitizedNumber} ] Setup error:`, error.message);
        if (res && !res.headersSent) {
            res.status(500).send({ 
                status: 'error', 
                message: `Failed to initialize connection.` 
            });
        }
    }
}

// ============================================
// 📌 AUTO RECONNECT ALL SESSIONS FROM DB
// ============================================
async function autoReconnectAll() {
    try {
        const sessions = await getAllSessions();
        console.log(`🔄 Found ${sessions.length} sessions to reconnect.`);

        for (const session of sessions) {
            const number = session.number;
            if (!global.activeSockets.has(number)) {
                console.log(`🔄 Reconnecting ${number}...`);
                startBot(number, { headersSent: true });
                await sleep(5000);
            }
        }
    } catch (error) {
        console.error('❌ Auto-reconnect error:', error);
    }
}

// Start auto-reconnect after 10 seconds
setTimeout(autoReconnectAll, 10000);

// ============================================
// 📌 CLEANUP ON EXIT
// ============================================
process.on('exit', () => {
    global.activeSockets.forEach((socket, number) => {
        try {
            socket.ws?.close();
        } catch (error) {}
        global.activeSockets.delete(number);
        global.socketCreationTime.delete(number);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { startBot, autoReconnectAll };
