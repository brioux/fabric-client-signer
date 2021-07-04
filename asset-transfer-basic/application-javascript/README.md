# Application overview **

- **Enroll a user with a Fabric Admin CA and store the generated private key on the the client app (browser).** 

For now I am using the native [localStorage](https://www.w3schools.com/html/html5_webstorage.asp) variable to persit user data in the browser. A client wallet should be used ina fully implemented sollution to store a user identity file

- **Setup a gateway on the node server**

This part is still a work in prgress and needs to be revisited. Connecting a [Fabric Gateway](https://hyperledger.github.io/fabric-sdk-node/release-2.2/module-fabric-network.Gateway.html) requires an identity file (e.g. X.509) with a private key. For now an X.509 identity is stored on the server filesystem (in addition to the client app), otherwise the gateway can not be connected. *This is not ideal so looking for a way to set up the gateway directly from the client app without sending the privateKey, or build a hole new Gateway class that fully relies on external private keys...*.

- **Submit TX form the client's app**

This revists how the [Transaction class](https://hyperledger.github.io/fabric-sdk-node/release-2.2/module-fabric-network.Transaction.html) works when submitting requests to Fabric. We implment a GatewaySession class located in */src* for the following process. The X.509 identity available on the file system is no longer used. Instead we sign the TX using the private keys stored on the client server. The client transaction submission is handeled by the JQuery $.get $.post requests in the *public/transactions.js* file. Node responses are handled by *router/index.js*.

*This is a rough implementation. It sometimes fails to connect to the fabric network, but works on next attempts. Probably an issue with how the request handlers are implemented.* 

1. **buildEndorsement(channelName,chaincodeName,args)** Build a TX endorsement on the desired channel and chaincode using TX arguments sent from the client app. 

2.  Send endorsement request to the client for signing as a sha256 hex.

3. **signEndorsement(signature)** The client provides a signature using the localy stored private key to send the endorsement. 

4. If successfful a commit request is returned to the client as another sha256 hex.

5. **commitPayload(signature)** Send the signed commit request to the server.

The above process is also implmented for query transactions. However these only require the first 3 steps using a query request (does not change ledger).

The */src/signer.js* file is used by the client to sign the endorsement, commit, and query requests inside the browser.


## Run the node server 

The app connects the client app (browser) with the Fabric network.

```bash
npm install
npm start
```

The static */public/transaction.js* file should be pacakged for the client when modified using [browserify](https://github.com/browserify/browserify#usage). This is to include any modules required for the transaction signing process. Use
```bash

npm run bundle
```

## Building your own certificate sign request (scr) to create the users identity file :

Use these commands to generate a csr that can be used when enrolling the user in *src/CAUtil.js*

**note the logic for registering self signed certificate is not yet implemented in the CAUtil**
```js
exports.enrollUser = async (user,csr=null) => {
}
```

```bash
openssl ecparam -name secp256k1 -genkey -noout -out secp256k1.pem

openssl req -new -nodes -sha256 -key prime256v1.pem -out test.csr -subj "/O=org1/OU=department1/CN=appUser"

openssl req -new -nodes -sha256 -key prime256v1.pem -out test.csr 

openssl ec -in ecprivkey.pem -pubout -out ecpubkey.pem

openssl asn1parse -in privkey.pem
```


