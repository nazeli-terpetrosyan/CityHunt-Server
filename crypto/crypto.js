const {Crypto}= require('@aeternity/aepp-sdk');

exports.UserKeyPair = () => {
    keypair = Crypto.generateKeyPair();
    return keypair
}