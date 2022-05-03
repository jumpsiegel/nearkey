const nearAPI = require("near-api-js");
const BN = require("bn.js");
const fs = require("fs").promises;
const assert = require("assert").strict;
const fetch = require('node-fetch');
const elliptic = require("elliptic");
const web3Utils = require("web3-utils");

function getConfig(env: any) {
  switch (env) {
    case "sandbox":
    case "local":
      return {
        networkId: "sandbox",
        nodeUrl: "http://localhost:3030",
        masterAccount: "test.near",
        contractAccount: Math.floor(Math.random() * 10000).toString() + "wormhole2.test.near",
      };
  }
}

const contractMethods = {
  viewMethods: [],
  changeMethods: ["recover_key"],
};
let config :any;
let masterAccount : any;
let masterKey : any;
let pubKey : any;
let keyStore : any;
let near : any;

async function initNear() {
  config = getConfig(process.env.NEAR_ENV || "sandbox");

  // Retrieve the validator key directly in the Tilt environment
  const response = await fetch('http://localhost:3031/validator_key.json');
  const keyFile = await response.json();

  masterKey = nearAPI.utils.KeyPair.fromString(
    keyFile.secret_key || keyFile.private_key
  );
  pubKey = masterKey.getPublicKey();
  keyStore = new nearAPI.keyStores.InMemoryKeyStore();
  keyStore.setKey(config.networkId, config.masterAccount, masterKey);
  near = await nearAPI.connect({
    deps: {
      keyStore,
    },
    networkId: config.networkId,
    nodeUrl: config.nodeUrl,
  });
  masterAccount = new nearAPI.Account(near.connection, config.masterAccount);
  console.log("Finish init NEAR: " + JSON.stringify(await masterAccount.getAccountBalance()));
}

async function createContractUser(
  accountPrefix : any,
  contractAccountId : any,
  contractMethod : any
) {
  let accountId = Math.floor(Math.random() * 10000).toString() + accountPrefix + "." + config.masterAccount;

  console.log(accountId);

  let resp = await masterAccount.createAccount(
    accountId,
    pubKey,
    new BN(10).pow(new BN(25))
  );
  console.log("accountId: " + JSON.stringify(resp))
    
  keyStore.setKey(config.networkId, accountId, masterKey);
  const account = new nearAPI.Account(near.connection, accountId);
  const accountUseContract = new nearAPI.Contract(
    account,
    contractAccountId,
    contractMethods
  );
  return accountUseContract;
}

async function initTest() {
  const contract = await fs.readFile("./target/wasm32-unknown-unknown/release/wormhole.wasm");

  const _contractAccount = await masterAccount.createAndDeployContract(
    config.contractAccount,
    pubKey,
    contract,
    new BN(10).pow(new BN(26))
  );

  const wormholeUseContract = await createContractUser(
    "wormhole",
    config.contractAccount,
    contractMethods
  );

  console.log("Finish deploy contracts and create test accounts");
  return { wormholeUseContract };
}

async function test() {

    const guardianKey = "52A26Ce40F8CAa8D36155d37ef0D5D783fc614d2";
    const guardianPrivKeys = "563d8d2fd4e701901d3846dee7ae7a92c18f1975195264d676f8407ac5976757";
    const message = Buffer.from("Hello there").toString("hex");
    const hash = web3Utils.keccak256(web3Utils.keccak256("0x" + message)).substr(2);

    
    const ec = new elliptic.ec("secp256k1");
    const key = ec.keyFromPrivate(guardianPrivKeys);
    const signature = key.sign(hash, { canonical: true });

    const sig = signature.r.toString(16) + signature.s.toString(16) ;
    console.log("hash: " + hash);
    console.log("sig: " + sig);
    console.log(signature);

  await initNear();
  const { wormholeUseContract } = await initTest();

  let ret = await wormholeUseContract.recover_key({ args: { digest: hash, sig: sig, recovery: signature.recoveryParam } });

  console.log(ret);
}

test();