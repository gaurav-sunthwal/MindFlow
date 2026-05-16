const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const { extractTextFromImage } = require('./ocr');
const { categorizeMessage } = require('./ai');
const { botApi } = require('./api');

const DATA_FILE = path.join(__dirname, 'data.txt');

const SENDER_NUMBER = '918329526333@s.whatsapp.net'; // +91 8329526333

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_v2');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['Mac OS', 'Chrome', '121.0.0'],
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n--- NEW QR CODE GENERATED ---');
      console.log('📢 Scan the QR code below to link WhatsApp:');
      qrcode.generate(qr, { small: true });
      
      // Backup: Provide a clickable link to see the QR
      const qrLink = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
      console.log('🔗 OR click this link to see the QR code:');
      console.log(qrLink);
      
      console.log('--- END OF QR CODE ---\n');
    }

    if (connection === 'close') {
      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      
      console.log('❌ Connection closed. Reason:', lastDisconnect?.error?.message || 'Unknown');
      
      if (shouldReconnect) {
        console.log('⏳ Reconnecting in 5 seconds...');
        setTimeout(() => startBot(), 5000);
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp Bot Connected!');
      
      // Send a welcome message to the owner
      await sock.sendMessage(SENDER_NUMBER, { 
        text: '🚀 *Task.ai Bot is Online!*\n\nI am now connected. I will only track messages sent by YOU (+91 8329526333).' 
      });
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    console.log(`📡 Event received: messages.upsert (Type: ${type}, Count: ${messages.length})`);
    
    for (const msg of messages) {
      console.log('📡 Processing individual message...');
      
      try {
        if (!msg.message) {
          console.log('⚠️ No message content found (protocol message).');
          continue;
        }

        const sender = msg.key.remoteJid;
        
        // Extract text content
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     msg.message.imageMessage?.caption || 
                     msg.message.buttonsResponseMessage?.selectedButtonId || "";

        // --- OWNER ONLY FILTER ---
        const participant = msg.key.participant || sender; // For groups, check participant
        
        const ownerNumber = '8329526333';
        const isFromOwner = msg.key.fromMe || (participant && participant.includes(ownerNumber));

        // Debug log to see why messages might be ignored
        console.log(`DEBUG: msg.key.id=${msg.key.id}, fromMe=${msg.key.fromMe}, sender=${sender}, participant=${participant}, isFromOwner=${isFromOwner}`);

        // Prevent infinite loops: Ignore messages that are our own bot replies
        const botEmojis = ['✅', '🎯', '💡', '📝', '🔗', '📁', '📦', '🚀', '🔒', '📸'];
        const isBotTemplate = text && (text.includes('identified') || text.includes('stored safely') || text.includes('sure what it is') || text.includes('IMPORTANT DOCUMENT'));
        
        if (msg.key.fromMe && (botEmojis.some(emoji => text && text.includes(emoji)) || isBotTemplate)) {
          console.log('ℹ️ Ignoring our own bot reply.');
          continue;
        }

        if (!isFromOwner) {
          // Quietly ignore messages from others
          continue;
        }

        console.log(`✅ Message from Owner accepted.`);
        
        console.log('🔍 DEEP INSPECT:', JSON.stringify(msg.message).substring(0, 200));
        console.log(`📝 Extracted Text: "${text}"`);

        const isImage = !!msg.message.imageMessage;

        console.log(`\n📩 Message from ${sender}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);

        // Processing Logic
        let result = null;
        let mediaBuffer = null;

        if (isImage) {
          console.log('📸 Image received, downloading...');
          mediaBuffer = await downloadMediaMessage(msg, 'buffer', {});
          const uniqueId = msg.key.id || Date.now().toString();
          const imgPath = path.join(__dirname, `temp_${uniqueId}.jpg`);
          fs.writeFileSync(imgPath, mediaBuffer);
          
          let contentToAnalyze = text;
          if (!contentToAnalyze) {
            console.log('🔍 No caption, running OCR...');
            const extractedText = await extractTextFromImage(imgPath);
            contentToAnalyze = extractedText;
          }

          result = await categorizeMessage(contentToAnalyze, true);
          
          try {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          } catch (e) {
            console.log('⚠️ Could not delete temp file:', e.message);
          }
        } else if (text) {
          // Fast path: if it's already JSON, parse it directly
          if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
            try {
              result = JSON.parse(text);
              result.source = "direct_json";
              console.log('📦 JSON received directly...');
            } catch (e) {
              console.log('🔤 Categorizing text...');
              result = await categorizeMessage(text, false);
            }
          } else {
            console.log('🔤 Categorizing text...');
            result = await categorizeMessage(text, false);
          }
        }

        if (result) {
          console.log('📂 Categorization:', result.category);
          
          // Special case: If image was empty and no text was found
          if (!result.content || result.content.trim() === "") {
            await sock.sendMessage(sender, { 
              text: "📸 I see an image, but I'm not sure what it is. Could you tell me what this is so I can save it correctly?"
            }, { quoted: msg });
            return;
          }

          // Simplified human-readable storage format
          const categoryLower = result.category.toLowerCase();
          let logEntry = `${categoryLower}: ${result.content}\n`;
          if (result.dayTime) {
            logEntry += `day/time: ${result.dayTime}\n`;
          }
          
          fs.appendFileSync(DATA_FILE, logEntry);
          console.log(`💾 Saved to data.txt ->\n${logEntry.trim()}`);

          // --- API INTEGRATION ---
          try {
            console.log(`🚀 Sending ${result.category} to Backend API...`);
            let apiResponse = null;

            switch (result.category) {
              case 'TASK':
              case 'BUCKETLIST':
                apiResponse = await botApi.createTask(result.content, result.category === 'BUCKETLIST' ? 'Bucketlist' : 'WhatsApp');
                break;
              case 'NOTE':
              case 'IDEA':
                apiResponse = await botApi.createNote(result.content.substring(0, 30) + '...', result.content);
                break;
              case 'REFERENCE':
                let storagePath = '#';
                if (mediaBuffer) {
                  console.log('📤 Uploading image to Supabase Storage...');
                  storagePath = await botApi.uploadFile(mediaBuffer, 'whatsapp_capture.jpg', 'image/jpeg');
                }
                apiResponse = await botApi.createDocument(
                  result.content.substring(0, 20).replace(/\n/g, ' ') + '...', 
                  'WhatsApp Capture', 
                  '0.1 MB', 
                  storagePath
                );
                break;
            }

            if (apiResponse) {
              console.log(`✅ Backend Sync Successful: ${apiResponse.id || 'OK'}`);
            }
          } catch (apiErr) {
            console.error('⚠️ API Sync Failed:', apiErr.message);
            // We don't stop the bot, just log the error since we have the data.txt backup
          }
          // -----------------------

          // Send a reply back to the group/sender
          const emojiMap = {
            'TASK': '✅',
            'BUCKETLIST': '🎯',
            'IDEA': '💡',
            'NOTE': '📝',
            'REFERENCE': '🔒',
            'OTHER': '📁'
          };
          const emoji = emojiMap[result.category] || '📦';
          
          let replyText = `${emoji} *${result.category}* identified.\n\n*Content:* ${result.content}`;
          if (result.category === 'REFERENCE') {
             replyText = `🔒 *IMPORTANT DOCUMENT* identified.\n\n✅ This has been stored safely in your Document Vault.`;
          } else {
            if (result.dayTime) {
              replyText += `\n*Day/Time:* ${result.dayTime}`;
            }
            if (result.reasoning) {
              replyText += `\n\n_Reason: ${result.reasoning}_`;
            }
          }
          
          await sock.sendMessage(sender, { 
            text: replyText
          }, { quoted: msg });
        }

      } catch (err) {
        console.error('❌ Error processing message:', err);
      }
    }
  });
}

startBot();
