const bcrypt = require('bcryptjs');

// *encrypt text function 
encryptText = async (text) => {
    try {
        let result = await bcrypt.hash(text, 10);
        return result;
    } catch (error) {
        return error;
    }
}

// *compare password function
comparePassword = async (plain_text, hash) => {
    try {
        let result = await bcrypt.compare(plain_text, hash);
        return result;
    } catch (error) {
        return error;
    }
}

module.exports = { 
    encryptText,
    comparePassword
}