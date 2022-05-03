target/wasm32-unknown-unknown/release/wormhole.wasm: src/lib.rs
	cargo build --target wasm32-unknown-unknown --release
