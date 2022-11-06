require("dotenv").config();

// It must be generated by generate-keys.js script
const jwks = require("./jwks.json");
const { Web3Linker } = require("./web3");

module.exports = {
  clients: [],
  interactions: {
    url(ctx, interaction) {
      return `/interaction/${interaction.uid}`;
    },
  },
  async findAccount(ctx, sub) {
    // sub is "/"-separated string
    const [network, nft_contract_address, nft_item_id] = sub.split("/");
    const web3linker = new Web3Linker(network);

    const nft_metadata = await web3linker.getNFTMetadata(
      nft_contract_address,
      nft_item_id
    );
    return {
      accountId: sub,
      async claims() {
        return {
          sub,
          network,
          nft_contract_address,
          nft_item_id,
          nft_metadata,
        };
      },
    };
  },
  responseTypes: ["id_token"],
  cookies: {
    keys: process.env.OIDCP_SECURE_KEYS.split(","),
  },
  claims: {
    openid: [
      "sub",
      "network",
      "nft_contract_address",
      "nft_item_id",
      "nft_metadata",
    ],
  },
  features: {
    devInteractions: {
      enabled: false,
    },
  },
  jwks,
};
