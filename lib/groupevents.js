const config = require('../config');
const { fkontak } = require('./functions');

// ============================================
// 📌 GROUP EVENTS HANDLER
// ============================================
const groupEvents = {
    // Handle group participants update
    handleGroupUpdate: async (socket, update) => {
        try {
            console.log('📢 Group update detected:', JSON.stringify(update));

            if (!update || !update.id) return;

            const groupId = update.id;
            const action = update.action;
            const participants = Array.isArray(update.participants) ? update.participants : [update.participants];

            for (const participant of participants) {
                if (!participant) continue;

                const userJid = typeof participant === 'string' ? participant : participant.id || participant;
                const userName = userJid.split('@')[0];

                let message = '';
                let mentions = [userJid];

                // Welcome message
                if (action === 'add') {
                    message = `╭━━【 🐢 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🐢 】━━━━━━━━╮
│ 👋 @${userName}
│ 🎉 Welcome to the group!
│ 📝 Type .menu to see commands
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

*${config.BOT_FOOTER}*`;
                }
                
                // Goodbye message
                else if (action === 'remove') {
                    message = `╭━━【 🐢 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 🐢 】━━━━━━━━╮
│ 👋 @${userName}
│ 💫 Farewell! We'll miss you!
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

*${config.BOT_FOOTER}*`;
                }
                
                // Promote message
                else if (action === 'promote') {
                    const author = update.author || '';
                    if (author) mentions.push(author);
                    message = `╭━━【 🐢 𝐏𝐑𝐎𝐌𝐎𝐓𝐄 🐢 】━━━━━━━━╮
│ ⬆️ @${userName}
│ 👑 Promoted to Admin!
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

*${config.BOT_FOOTER}*`;
                }
                
                // Demote message
                else if (action === 'demote') {
                    const author = update.author || '';
                    if (author) mentions.push(author);
                    message = `╭━━【 🐢 𝐃𝐄𝐌𝐎𝐓𝐄 🐢 】━━━━━━━━╮
│ ⬇️ @${userName}
│ 👑 Demoted from Admin!
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

*${config.BOT_FOOTER}*`;
                }

                if (message) {
                    await socket.sendMessage(groupId, { 
                        text: message, 
                        mentions: mentions.filter(m => m) 
                    }, { quoted: fkontak });
                    console.log(`✅ Sent ${action} message for ${userName}`);
                }
            }
        } catch (err) {
            console.error('❌ Group event error:', err.message);
        }
    },

    // Handle group settings update
    handleGroupSettings: async (socket, update) => {
        try {
            console.log('⚙️ Group settings update:', update);
            
            const { id, subject, subjectOwner, subjectTime, desc, descOwner, descTime, restrict, announce } = update;
            
            if (subject) {
                await socket.sendMessage(id, {
                    text: `📝 *Group name changed to:*\n${subject}\n\nBy: @${subjectOwner?.split('@')[0] || 'Unknown'}`,
                    mentions: subjectOwner ? [subjectOwner] : []
                }, { quoted: fkontak });
            }
            
            if (desc) {
                await socket.sendMessage(id, {
                    text: `📋 *Group description updated!*\n\nNew description:\n${desc}`
                }, { quoted: fkontak });
            }
            
            if (restrict !== undefined) {
                const status = restrict ? '🔒 *Closed* (Only admins)' : '🔓 *Open* (Everyone)';
                await socket.sendMessage(id, {
                    text: `⚙️ *Group settings changed*\n\nSend messages: ${status}`
                }, { quoted: fkontak });
            }
            
            if (announce !== undefined) {
                const status = announce ? '🔇 *Muted* (Only admins)' : '🔊 *Unmuted* (Everyone)';
                await socket.sendMessage(id, {
                    text: `🔊 *Group announcement mode*\n\n${status}`
                }, { quoted: fkontak });
            }
        } catch (err) {
            console.error('❌ Group settings error:', err.message);
        }
    },

    // Handle group invite
    handleGroupInvite: async (socket, msg, inviteMsg) => {
        try {
            const groupName = inviteMsg.groupName || "Unknown Group";
            const inviteCode = inviteMsg.inviteCode;
            const inviter = msg.key.participant || msg.key.remoteJid;
            const inviterName = inviter.split('@')[0];

            console.log(`📩 Received group invite: ${groupName} from ${inviterName}`);

            // Try to join group
            const response = await socket.groupAcceptInvite(inviteCode);

            if (response?.gid) {
                console.log(`✅ Joined group: ${groupName} (ID: ${response.gid})`);

                // Send thank you to inviter
                await socket.sendMessage(inviter, {
                    text: `✅ Asante kwa kualika kwenye group: *${groupName}*\n\nBot imejiunga kikamilifu!`
                }, { quoted: fkontak });

                // Send welcome message to group
                await socket.sendMessage(response.gid, {
                    text: `╭━━【 🐢 𝐁𝐎𝐓 𝐉𝐎𝐈𝐍𝐄𝐃 🐢 】━━━━━━━━╮
│ 🤖 ${config.BOT_NAME}
│ 👋 Hello everyone!
│ 📝 Type .menu for commands
│ 🔧 Invited by: @${inviterName}
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

*${config.BOT_FOOTER}*`,
                    mentions: [inviter]
                }, { quoted: fkontak });

                return true;
            } else {
                throw new Error('No group ID in response');
            }

        } catch (error) {
            console.error('❌ Failed to join group:', error.message);

            let errorMsg = 'Failed to join group';
            if (error.message.includes('already')) {
                errorMsg = 'Tayari nipo kwenye group hii';
            } else if (error.message.includes('expired') || error.message.includes('invalid')) {
                errorMsg = 'Group invite link is expired or invalid';
            } else if (error.message.includes('banned') || error.message.includes('blocked')) {
                errorMsg = 'Cannot join (banned/blocked)';
            }

            await socket.sendMessage(inviter, {
                text: `❌ ${errorMsg}: ${groupName}`
            }, { quoted: fkontak });

            return false;
        }
    }
};

// ============================================
// 📌 SETUP GROUP EVENTS LISTENER
// ============================================
const setupGroupEventsListener = (socket) => {
    // Listen for group participants updates
    socket.ev.on('group-participants.update', async (update) => {
        await groupEvents.handleGroupUpdate(socket, update);
    });

    // Listen for group settings updates
    socket.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            await groupEvents.handleGroupSettings(socket, update);
        }
    });

    console.log('✅ Group events listener setup complete');
};

module.exports = {
    groupEvents,
    setupGroupEventsListener
};
