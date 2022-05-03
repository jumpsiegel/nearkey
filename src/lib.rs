#![allow(unused_mut)]
#![allow(unused_imports)]

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen};

use hex;

//near_sdk::setup_alloc!();

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
//     let  mut      m : [u8; 32] = [0; 32]; 
//     let  mut      s : [u8; 64] = [0; 64];
//     let  mut      v : u8 = 1;

     let h = hex::decode(digest).expect("invalid digest");
     let s = hex::decode(sig).expect("invalid signature");

     assert!(h.len() == 32);
     assert!(s.len() == 64);

     let ret = env::ecrecover(&h, &s, recovery, true).expect("cannot recover key");
     return hex::encode(ret);
//       return digest;
   }
 }
