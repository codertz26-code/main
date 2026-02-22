const { cmd } = global;
const axios = require('axios');
const yts = require('yt-search');
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "song",
    alias: ["mp3", "music", "play"],
    desc: "Download song as MP3 from YouTube",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, q, prefix, reply, l, isOwner, body, command }) => {
    try {
        // Get the query properly
        const query = args.join(' ').trim();
        
        if (!query) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                       `│\n` +
                       `│ 🐢 How To Use Song Downloader\n` +
                       `│\n` +
                       `│ ✦ ${prefix}${command} <song name>\n` +
                       `│   Example: ${prefix}${command} shape of you\n` +
                       `│\n` +
                       `│ ✦ ${prefix}${command} <YouTube URL>\n` +
                       `│   Example: ${prefix}${command} https://youtu.be/...\n` +
                       `│\n` +
                       `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                       `> ${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Send searching message with reaction
        await conn.sendMessage(from, {
            react: { text: "🔍", key: mek.key }
        });

        // Send searching status
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                   `│\n` +
                   `│ 🔍 𝚂𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐 𝚏𝚘𝚛: *${query}*\n` +
                   `│\n` +
                   `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                   `> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        let videoData = null;

        // Check if it's a direct YouTube URL
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            const videoId = query.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            
            if (!videoId) {
                await conn.sendMessage(from, {
                    react: { text: "❌", key: mek.key }
                });
                return await conn.sendMessage(from, {
                    text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                           `│\n` +
                           `│ ❌ 𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝚕𝚒𝚗𝚔!\n` +
                           `│\n` +
                           `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                           `> ${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
            
            const search = await yts({ videoId: videoId });
            if (search) videoData = search;
        } else {
            // Search for the song
            const search = await yts(query);
            
            if (!search || !search.videos || search.videos.length === 0) {
                await conn.sendMessage(from, {
                    react: { text: "❌", key: mek.key }
                });
                return await conn.sendMessage(from, {
                    text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                           `│\n` +
                           `│ ❌ 𝙽𝚘 𝚛𝚎𝚜𝚞𝚕𝚝𝚜 𝚏𝚘𝚞𝚗𝚍 𝚏𝚘𝚛: *${query}*\n` +
                           `│\n` +
                           `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                           `> ${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
            
            videoData = search.videos[0];
        }

        if (!videoData) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: mek.key }
            });
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                       `│\n` +
                       `│ ❌ 𝙲𝚘𝚞𝚕𝚍 𝚗𝚘𝚝 𝚐𝚎𝚝 𝚟𝚒𝚍𝚎𝚘 𝚒𝚗𝚏𝚘𝚛𝚖𝚊𝚝𝚒𝚘𝚗!\n` +
                       `│\n` +
                       `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                       `> ${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const videoUrl = videoData.url;
        const title = videoData.title || 'Unknown Title';
        const thumbnail = videoData.thumbnail || 'https://i.ytimg.com/vi/default.jpg';
        const duration = videoData.timestamp || videoData.duration || 'N/A';
        const views = videoData.views ? videoData.views.toLocaleString() : 'N/A';

        // Create caption with song info
        const caption = `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                       `│ 🐢 *Song Found!*\n` +
                       `│\n` +
                       `│ 🎵 *Title:* ${title.substring(0, 40)}\n` +
                       `│ ⏱️ *Duration:* ${duration}\n` +
                       `│ 👁️ *Views:* ${views}\n` +
                       `│ 🔗 *Link:* ${videoUrl}\n` +
                       `│\n` +
                       `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                       `> ${config.BOT_FOOTER}`;

        // Create buttons for download options
        const buttons = [
            {
                buttonId: `${prefix}audiostream_${Buffer.from(videoUrl).toString('base64')}_${Buffer.from(title).toString('base64')}`,
                buttonText: { displayText: '🎵 𝙰𝚞𝚍𝚒𝚘 𝙼𝙿𝟹' },
                type: 1
            },
            {
                buttonId: `${prefix}audiodoc_${Buffer.from(videoUrl).toString('base64')}_${Buffer.from(title).toString('base64')}`,
                buttonText: { displayText: '📄 𝙰𝚞𝚍𝚒𝚘 𝙳𝚘𝚌' },
                type: 1
            }
        ];

        const buttonMessage = {
            image: { url: thumbnail },
            caption: caption,
            footer: config.BOT_FOOTER,
            buttons: buttons,
            headerType: 4,
            contextInfo: getContextInfo({ sender: sender })
        };

        // Send image with buttons
        await conn.sendMessage(from, buttonMessage, { quoted: fkontak });

        // Change reaction to indicate success
        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        });

    } catch (error) {
        console.error("Song command error:", error);
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                   `│\n` +
                   `│ ⚠️ *Error:* ${error.message.substring(0, 50)}\n` +
                   `│\n` +
                   `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                   `> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// AUDIO STREAM BUTTON HANDLER
// ============================================
cmd({
    pattern: "audiostream",
    alias: ["audiomp3"],
    desc: "Handle audio stream button",
    category: "download",
    react: "🎵",
    filename: __filename,
    dontAddCommandList: true
}, async (conn, mek, m, { from, sender, args, q, prefix, reply, l }) => {
    try {
        if (!args[0]) return;

        // Decode the data from button
        const [encodedUrl, encodedTitle] = args;
        const videoUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
        const title = Buffer.from(encodedTitle, 'base64').toString('utf-8');

        await conn.sendMessage(from, {
            react: { text: "⬇️", key: mek.key }
        });

        // Download and send as audio stream
        const fallbackApi = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
        const fallbackResponse = await axios.get(fallbackApi, { timeout: 30000 });
        const fallbackData = fallbackResponse.data;

        if (fallbackData?.status && fallbackData.audio) {
            await conn.sendMessage(from, {
                audio: { url: fallbackData.audio },
                mimetype: "audio/mpeg",
                fileName: `${title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp3`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });

            await conn.sendMessage(from, {
                react: { text: "✅", key: mek.key }
            });

        } else {
            throw new Error('No audio URL found');
        }

    } catch (error) {
        console.error("Audio stream error:", error);
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                   `│\n` +
                   `│ ❌ *Failed to download audio!*\n` +
                   `│\n` +
                   `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                   `> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// AUDIO DOC BUTTON HANDLER
// ============================================
cmd({
    pattern: "audiodoc",
    alias: ["audiodocument"],
    desc: "Handle audio document button",
    category: "download",
    react: "📄",
    filename: __filename,
    dontAddCommandList: true
}, async (conn, mek, m, { from, sender, args, q, prefix, reply, l }) => {
    try {
        if (!args[0]) return;

        // Decode the data from button
        const [encodedUrl, encodedTitle] = args;
        const videoUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
        const title = Buffer.from(encodedTitle, 'base64').toString('utf-8');

        await conn.sendMessage(from, {
            react: { text: "⬇️", key: mek.key }
        });

        // Download and send as document
        const fallbackApi = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
        const fallbackResponse = await axios.get(fallbackApi, { timeout: 30000 });
        const fallbackData = fallbackResponse.data;

        if (fallbackData?.status && fallbackData.audio) {
            await conn.sendMessage(from, {
                document: { url: fallbackData.audio },
                mimetype: "audio/mpeg",
                fileName: `${title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp3`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });

            await conn.sendMessage(from, {
                react: { text: "✅", key: mek.key }
            });

        } else {
            throw new Error('No audio URL found');
        }

    } catch (error) {
        console.error("Audio document error:", error);
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                   `│\n` +
                   `│ ❌ *Failed to download audio document!*\n` +
                   `│\n` +
                   `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                   `> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
