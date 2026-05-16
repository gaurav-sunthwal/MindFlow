const nlp = require('compromise');
nlp.extend(require('compromise-dates'));

/**
 * Intelligent Local Categorization using Compromise NLP + Dates Plugin
 */
function categorizeMessage(text, hasImage = false) {
  const doc = nlp(text);
  const t = text.toLowerCase();
  
  console.log(`🧠 Local NLP Processing: "${text.substring(0, 30)}..."`);

  // 1. Extract Dates and Times
  let foundDayTime = "";
  const dates = doc.dates();
  if (dates.length > 0) {
    foundDayTime = dates.text();
  }

  // Timeframe detection
  const isLongTerm = t.includes('this year') || t.includes('next year') || t.includes('one day') || t.includes('oneday') || t.includes('someday') || t.includes('future') || t.includes('eventually');
  const isNearTerm = t.includes('today') || t.includes('tomorrow') || t.includes('tommorow') || t.includes('tonight') || /at\s*\d/.test(t) || t.includes('pm') || t.includes('am');

  // 2. Identify Keywords
  const isBucketlistKeyword = doc.match('(want|wish|visit|go to|dream|buy later)').found;
  const isTaskKeyword = doc.match('(buy|call|send|meet|todo|task|remind|finish|complete|need to)').found;
  
  // Important Document detection (Expanded for IDs, Bills, and Transactions)
  const docKeywords = [
    'aadhar', 'aadhaar', 'uidai', 'unique identification', 
    'pan card', 'permanent account number', 'incometaxdepartment',
    'driving license', 'licence', 'transport department',
    'passport', 'voter id', 'marksheet', 'certificate', 
    'invoice', 'receipt', 'document', 'policy', 
    'bill', 'utility', 'electricity', 'mseb', 'mahadiscom', 'gas bill', 'water bill',
    '₹', 'rs.', 'rupees', 'paid', 'transaction', 'amount', 'total', 'upi', 'bank', 'debit', 'credit',
    'kotak', 'hdfc', 'sbi', 'icici', 'axis bank', 'transferred', 'credited', 'debited', 'payment'
  ];
  const isDocument = docKeywords.some(k => t.includes(k));

  // PRIORITY LOGIC:
  
  // 1. Important Documents & Bills always go to REFERENCE
  if (isDocument || (hasImage && !isTaskKeyword && !isBucketlistKeyword && !foundDayTime)) {
    return {
      category: "REFERENCE",
      content: text,
      dayTime: foundDayTime,
      reasoning: isDocument ? "Document, bill, or financial transaction detected" : "Image received, stored in Vault",
      isActionable: false
    };
  }

  // 2. Long-term goals go to BUCKETLIST
  if (isLongTerm) {
    return {
      category: "BUCKETLIST",
      content: text,
      dayTime: foundDayTime,
      reasoning: "Long-term timeframe detected",
      isActionable: false
    };
  }

  // 3. Near-term dates go to TASK
  if (foundDayTime || isNearTerm) {
    let dayToLog = foundDayTime;
    if (!dayToLog) {
      const match = t.match(/today|tomorrow|tommorow|tonight|next week/i);
      if (match) dayToLog = match[0];
    }
    
    return {
      category: "TASK",
      content: text,
      dayTime: dayToLog,
      reasoning: "Near-term actionable item",
      isActionable: true
    };
  }

  // 4. If it has "want" but no time -> BUCKETLIST
  if (isBucketlistKeyword) {
    return {
      category: "BUCKETLIST",
      content: text,
      dayTime: foundDayTime,
      reasoning: "General goal or wish",
      isActionable: false
    };
  }

  // 5. If it has a task keyword -> TASK
  if (isTaskKeyword) {
    return {
      category: "TASK",
      content: text,
      dayTime: foundDayTime,
      reasoning: "Action keyword detected",
      isActionable: true
    };
  }

  // 6. Default to NOTE
  return {
    category: "NOTE",
    content: text,
    dayTime: foundDayTime,
    reasoning: "Defaulted to note",
    isActionable: false
  };
}

module.exports = { categorizeMessage };
