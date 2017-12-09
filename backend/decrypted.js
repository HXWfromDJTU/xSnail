var crypto = require('crypto');
module.exports.dec = {
    decrypteds : function (encrypted) {
            var decrypted = "";
            var decipher = crypto.createDecipher("aes-256-cbc", "MzZaFw0yNDA2MDYwNzI4MzZaMIGIMQswCQYDVQQGEwJDTjERMA8GA1UECAwIU2hh");
            decrypted += decipher.update(encrypted, 'hex', 'binary');
            decrypted += decipher.final('binary');
            return decrypted;
    }
        
}