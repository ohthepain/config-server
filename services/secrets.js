const fs = require('fs');
const path = require('path');

function readSecret(secretName) {
  const secretFilePath = path.join('./secrets', secretName);
  try {
    const secretContent
     = fs.readFileSync(secretFilePath, 'utf8');
    return secretContent.trim();
  } catch (error) {
    console.error(`Error reading secret file: ${secretName}`, error);
    throw error;
  }
}

module.exports = { readSecret }
