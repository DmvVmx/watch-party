// Middleware для безопасности

// Валидация данных
const validateMessage = (data) => {
  if (!data.message || typeof data.message !== 'string') {
    return false
  }
  
  if (data.message.length > 500) {
    return false
  }
  
  if (data.message.trim().length === 0) {
    return false
  }
  
  return true
}

const sanitizeString = (str) => {
  if (typeof str !== 'string') return ''
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
           .replace(/[<>&"']/g, (match) => {
             const escape = {
               '<': '&lt;',
               '>': '&gt;',
               '&': '&amp;',
               '"': '&quot;',
               "'": '&#x27;'
             }
             return escape[match]
           })
           .trim()
}

module.exports = {
  validateMessage,
  sanitizeString
}