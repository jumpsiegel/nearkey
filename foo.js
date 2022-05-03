let elliptic    = require('elliptic');
const web3Utils = require("web3-utils");
let ec          = new elliptic.ec('secp256k1');

const guardianKey = "beFA429d57cD18b7F8A4d91A2da9AB4AF05d0FBe";
const guardianPrivKeys = "cfb12303a19cde580bb4dd771639b0d26bc68353645571a8cff516ab2ee113a0";

let keyPair = ec.keyFromPrivate(guardianPrivKeys);
let privKey = keyPair.getPrivate("hex");
let pubKey = keyPair.getPublic();
console.log(`Private key: ${privKey}`);

console.log("Public key :", pubKey.encode("hex"))
console.log("Public key (compressed):", pubKey.encodeCompressed("hex"));

console.log();

let msg = 'Message for signing';
let msgHash = web3Utils.keccak256(msg).substr(2);
let signature = ec.sign(msgHash, privKey, "hex", {canonical: true});
console.log(`Msg: ${msg}`);
console.log(`Msg hash: ${msgHash}`);
console.log("Signature:", signature);

console.log();

let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
let pubKeyRecovered = ec.recoverPubKey(hexToDecimal(msgHash), signature, signature.recoveryParam, "hex");

console.log("Recovered pubKey:", pubKeyRecovered.encode("hex"));
console.log("Recovered pubKey (compressed):", pubKeyRecovered.encodeCompressed("hex"));

console.log("guardianKey:", guardianKey);

let validSig = ec.verify(msgHash, signature, pubKeyRecovered);
console.log("Signature valid?", validSig);
