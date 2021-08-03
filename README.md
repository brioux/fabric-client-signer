# A demo client signer for Hyperledger fabric (offline private keys)

This is a node.js app for interating with a Hyperleder network. 
It allows users to sign transactions from the browser (offline private key) that are submited to a fabric network by the server. It rebuilds a transaction submission process following the tutorial provided by the [Fabric node.js SDK](https://hyperledger.github.io/fabric-sdk-node/release-2.2/tutorial-sign-transaction-offline.html)

This demo uses a rebuild of the [Fabric test network](https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html) with Mac OS binaries. The asset-transfer-basic example is used

*work in prgress ...*

## Start the Fabric network 

First get the network running with docker from test-network
```bash
cd test-network
./restart.sh
```
## Run the node server 

The app connects the client app (browser) with the Fabric network.

```bash
cd asset-transfer-basic/application-javascript/
npm install
npm start
```
