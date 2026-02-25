
require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

console.log('🤖 Bot starting...');

bot.start((ctx) => {
    ctx.reply('👋 Hello! Main AI hoon. Kuch bhi poochiye!');
});

bot.on('text', async (ctx) => {
    const userMsg = ctx.message.text;
    console.log('📩', ctx.from.first_name, ':', userMsg);
    
    await ctx.sendChatAction('typing');
    
    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'gryphe/mythomist-7b:free',
                messages: [{ role: 'user', content: userMsg }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://t.me/',
                    'X-Title': 'Telegram Bot'
                },
                timeout: 30000
            }
        );
        
        const reply = response.data.choices[0].message.content;
        console.log('🤖 Reply:', reply.substring(0, 50) + '...');
        
        if (reply.length > 4096) {
            for (let i = 0; i < reply.length; i += 4096) {
                await ctx.reply(reply.substring(i, i + 4096));
            }
        } else {
            await ctx.reply(reply);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.status || error.message);
        ctx.reply('⚠️ Error aa gaya! Dobara try karein.');
    }
});

bot.launch();
console.log('✅ Bot is running!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
