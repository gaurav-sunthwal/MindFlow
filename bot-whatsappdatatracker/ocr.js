const Tesseract = require('tesseract.js');

/**
 * Runs OCR on an image and returns the raw text.
 * This text can then be sent to an AI for categorization.
 */
async function extractTextFromImage(imagePath) {
  console.log('🔍 Running Tesseract OCR...');

  const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
    logger: m => {
      if (m.status === 'recognizing text') {
        process.stdout.write(`\r   OCR progress: ${Math.round(m.progress * 100)}%`);
      }
    }
  });

  console.log('\n📄 Raw OCR Text extracted.');
  return text.trim();
}

module.exports = { extractTextFromImage };
