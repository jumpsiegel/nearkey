#![allow(unused_mut)]
#![allow(unused_imports)]

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen};

use hex;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Wormhole {
}

impl Default for Wormhole {
    fn default() -> Self {
        Self {
        }
    }
}

#[near_bindgen]
impl Wormhole {
   pub fn recover_key(&mut self, digest : String, sig: String, recovery: u8) -> String {
     let h = hex::decode(digest).expect("invalid digest");
     let s = hex::decode(sig).expect("invalid signature");

     let ret = env::ecrecover(&h, &s, recovery, true).expect("cannot recover key");
     return hex::encode(&env::keccak256(&ret)[12..32]);
   }
 }
