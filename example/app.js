const path = require("path");
const jose = require("jose");
const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");
const app = express();
const port = process.env.PORT || 3001;

const staticFile = (filename) => {
  return path.resolve(__dirname, "static", filename);
};

const accounts = [2, 5, 6, 7, 8, 9, 10, 11].map((n) => {
  return {
    nft_contract_address: "0xF97Bd91B2399d4b45232717f1288C0f1dC9eEe09",
    nft_item_id: n,
  };
});

const prd = process.env.NODE_ENV === "production";

app.use(
  auth({
    issuerBaseURL: prd ? "https://nftoidc.clsl.net" : "http://localhost:3000",
    baseURL: prd
      ? "https://nftoidc-example.clsl.net"
      : "https://example.localhost",
    clientID: "8fbe64c4-c279-4f91-971d-1419a9553ddb", // change to your clientID
    secret:
      "TUWEpEMjCQbx1U/pIHHLENM2GjSRKYSclCVAVdhsD7sJPXTejwNetYz714c95zih6g4QVE/W43PIgmdgqpyrCDubk0IqExGBdvrl6wiRTa2IMlmOSkdw2UUuhbKPX9GzGIc/okHGwJ+qAWLuFonqblW8BqQuocjXvbCka/FKvfRty25QJIe2tssEpqtNlg1RRMh6iHsYT8QCter89SxlVcaATBXjhpZSL1o+VHjtpEIeeWIe25aYWr2eQuJA+oeGuF4qRh/16nhHsynG19cdqpPdgpT3oD4AB+cd/57UHxP3DKnAw3UD3bPn/Pm/wh5VbMjvW7gfhYp8pDzChV/JLw==", // change to your clientSecret
    authRequired: false,
    authorizationParams: {
      response_type: "id_token",
      response_mode: "form_post",
      scope: "openid",
    },
    idpLogout: false,
    afterCallback: (req, res, session) => {
      const claims = jose.decodeJwt(session.id_token);
      // example
      // {
      //   sub: '0xF97Bd91B2399d4b45232717f1288C0f1dC9eEe09/2',
      //   nft_contract_address: '0xF97Bd91B2399d4b45232717f1288C0f1dC9eEe09',
      //   nft_item_id: '2',
      //   nonce: 'zMBFYuM5WRy86IOIFcGYl7PM8tPHBPSl0WmPtG7F4Ac',
      //   s_hash: 'WxpefKbbgUvRDs_oYHGBQw',
      //   aud: 'example_client',
      //   exp: 1667108741,
      //   iat: 1667105141,
      //   iss: 'http://localhost:3000'
      // }
      const { nft_contract_address, nft_item_id } = claims;
      const validAccount = accounts.find(
        (account) =>
          account.nft_contract_address.toLowerCase() ===
            nft_contract_address.toLowerCase() &&
          account.nft_item_id == nft_item_id
      );

      if (!validAccount) {
        res.send("Not Allowed NFT");
        return;
      }

      return session;
    },
  })
);

app.get("/", (req, res) => {
  res.sendFile(staticFile("index.html"));
});

app.get("/private", requiresAuth(), (req, res) => {
  res.sendFile(staticFile("private.html"));
});

app.get("/images/:image", requiresAuth(), (req, res) => {
  res.sendFile(staticFile(`images/${req.params.image}`));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
