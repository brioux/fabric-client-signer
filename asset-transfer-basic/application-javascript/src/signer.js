'use strict';
const { bufferHex } = require('./AppUtil.js');

exports.signHex = (digest,privateKeyPEM) => {
    const jsrsasign = require('jsrsasign');
    const { prvKeyHex } = jsrsasign.KEYUTIL.getKey(privateKeyPEM); 
    
    const elliptic = require('elliptic');
    const EC = elliptic.ec;
    const ecdsaCurve = elliptic.curves['p256'];
    
    const ecdsa = new EC(ecdsaCurve);
    const signKey = ecdsa.keyFromPrivate(prvKeyHex, 'hex');
    const sig = ecdsa.sign(Buffer.from(digest, 'hex'), signKey);
    
    // now we have the signature, 
    // next we should send the signed transaction proposal to the peer
    let signature = Buffer.from(sig.toDER());
    return bufferHex(signature);
}




