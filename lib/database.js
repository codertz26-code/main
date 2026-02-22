const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');

// Database paths
const DB_PATH = './database';
const CHATBOT_FILE = path.join(DB_PATH, 'chatbot.json');
const SETTINGS_FILE = path.join(DB_PATH, 'settings.json');

// Ensure database directory exists
if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
}

// ============================================
// 📌 MONGODB SCHEMAS
// ============================================
const sessionSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    sessionId: { type: String },
    settings: { type: Object, default: {} },
    creds: { type: Object },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const settingsSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    settings: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// ============================================
// 📌 MONGODB MODELS
// ============================================
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

// ============================================
// 📌 CHATBOT DATABASE
// ============================================
const chatbotDB = {
    // Get chatbot settings
    getChatbotSettings: async () => {
        try {
            if (fs.existsSync(CHATBOT_FILE)) {
                const data = await fs.readFile(CHATBOT_FILE, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error reading chatbot settings:', error);
        }
        return { global: { enabled: true } }; // Default enabled
    },

    // Update chatbot settings
    updateChatbotSettings: async (settings) => {
        try {
            await fs.writeFile(CHATBOT_FILE, JSON.stringify(settings, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving chatbot settings:', error);
            return false;
        }
    },

    // Toggle chatbot
    toggleChatbot: async (enabled) => {
        try {
            const settings = await chatbotDB.getChatbotSettings();
            settings.global.enabled = enabled;
            await chatbotDB.updateChatbotSettings(settings);
            return settings;
        } catch (error) {
            console.error('Error toggling chatbot:', error);
            return null;
        }
    }
};

// ============================================
// 📌 USER PREFERENCES DATABASE
// ============================================
const userDB = {
    // Get user settings
    getUserSettings: async (userId) => {
        try {
            const all = await userDB.getAllSettings();
            return all[userId] || {};
        } catch (error) {
            console.error('Error getting user settings:', error);
            return {};
        }
    },

    // Update user settings
    updateUserSettings: async (userId, settings) => {
        try {
            let all = {};
            if (fs.existsSync(SETTINGS_FILE)) {
                all = JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf8'));
            }
            all[userId] = { ...(all[userId] || {}), ...settings };
            await fs.writeFile(SETTINGS_FILE, JSON.stringify(all, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving user settings:', error);
            return false;
        }
    },

    // Get all settings
    getAllSettings: async () => {
        try {
            if (fs.existsSync(SETTINGS_FILE)) {
                return JSON.parse(await fs.readFile(SETTINGS_FILE, 'utf8'));
            }
        } catch (error) {
            console.error('Error reading all settings:', error);
        }
        return {};
    }
};

// ============================================
// 📌 GROUP SETTINGS DATABASE
// ============================================
const groupDB = {
    // Get group settings
    getGroupSettings: async (groupId) => {
        try {
            const all = await groupDB.getAllGroups();
            return all[groupId] || { welcome: false, goodbye: false, antilink: false };
        } catch (error) {
            return { welcome: false, goodbye: false, antilink: false };
        }
    },

    // Update group settings
    updateGroupSettings: async (groupId, settings) => {
        try {
            const groupFile = path.join(DB_PATH, 'groups.json');
            let all = {};
            if (fs.existsSync(groupFile)) {
                all = JSON.parse(await fs.readFile(groupFile, 'utf8'));
            }
            all[groupId] = { ...(all[groupId] || {}), ...settings };
            await fs.writeFile(groupFile, JSON.stringify(all, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving group settings:', error);
            return false;
        }
    },

    // Get all groups
    getAllGroups: async () => {
        try {
            const groupFile = path.join(DB_PATH, 'groups.json');
            if (fs.existsSync(groupFile)) {
                return JSON.parse(await fs.readFile(groupFile, 'utf8'));
            }
        } catch (error) {
            console.error('Error reading groups:', error);
        }
        return {};
    }
};

// ============================================
// 📌 MONGODB SESSION FUNCTIONS
// ============================================
const mongoDB = {
    // Save session to MongoDB
    saveSession: async (number, creds) => {
        try {
            const sanitizedNumber = number.replace(/[^0-9]/g, '');
            await Session.findOneAndUpdate(
                { number: sanitizedNumber },
                { 
                    $set: { 
                        creds: creds,
                        updatedAt: new Date()
                    }
                },
                { upsert: true, new: true }
            );
            return true;
        } catch (error) {
            console.error('Error saving session to MongoDB:', error);
            return false;
        }
    },

    // Get session from MongoDB
    getSession: async (number) => {
        try {
            const sanitizedNumber = number.replace(/[^0-9]/g, '');
            const session = await Session.findOne({ number: sanitizedNumber }).sort({ updatedAt: -1 });
            return session ? session.creds : null;
        } catch (error) {
            console.error('Error getting session from MongoDB:', error);
            return null;
        }
    },

    // Delete session from MongoDB
    deleteSession: async (number) => {
        try {
            const sanitizedNumber = number.replace(/[^0-9]/g, '');
            await Session.deleteMany({ number: sanitizedNumber });
            await Settings.deleteOne({ number: sanitizedNumber });
            return true;
        } catch (error) {
            console.error('Error deleting session from MongoDB:', error);
            return false;
        }
    },

    // Get all sessions
    getAllSessions: async () => {
        try {
            return await Session.find({}).sort({ updatedAt: -1 });
        } catch (error) {
            console.error('Error getting all sessions:', error);
            return [];
        }
    },

    // Save settings to MongoDB
    saveSettings: async (number, settings) => {
        try {
            const sanitizedNumber = number.replace(/[^0-9]/g, '');
            await Settings.findOneAndUpdate(
                { number: sanitizedNumber },
                { 
                    $set: { 
                        settings: settings,
                        updatedAt: new Date()
                    }
                },
                { upsert: true, new: true }
            );
            return true;
        } catch (error) {
            console.error('Error saving settings to MongoDB:', error);
            return false;
        }
    },

    // Get settings from MongoDB
    getSettings: async (number) => {
        try {
            const sanitizedNumber = number.replace(/[^0-9]/g, '');
            const settingsDoc = await Settings.findOne({ number: sanitizedNumber });
            return settingsDoc ? settingsDoc.settings : null;
        } catch (error) {
            console.error('Error getting settings from MongoDB:', error);
            return null;
        }
    }
};

module.exports = {
    chatbotDB,
    userDB,
    groupDB,
    mongoDB,
    
    // Shortcut functions
    getChatbotSettings: chatbotDB.getChatbotSettings,
    updateChatbotSettings: chatbotDB.updateChatbotSettings,
    toggleChatbot: chatbotDB.toggleChatbot,
    
    getUserSettings: userDB.getUserSettings,
    updateUserSettings: userDB.updateUserSettings,
    
    getGroupSettings: groupDB.getGroupSettings,
    updateGroupSettings: groupDB.updateGroupSettings,
    
    saveSession: mongoDB.saveSession,
    getSession: mongoDB.getSession,
    deleteSession: mongoDB.deleteSession,
    getAllSessions: mongoDB.getAllSessions,
    saveSettings: mongoDB.saveSettings,
    getSettings: mongoDB.getSettings,
    
    // Models
    Session,
    Settings
};
