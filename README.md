# A demo client signer for Hyperledger fabric 

This is a node.js app that allows transactions to be signed by the client app (browser) for submission to a fabric network. It rebuilds the transaction submission process provided by the [Fabric javascript SDK](https://hyperledger.github.io/fabric-sdk-node/release-2.2/tutorial-sign-transaction-offline.html)

This is a rebuild of the [Fabric test network](https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html) using the Mac OS binaries. The asset-transfer-basic example is used for the demo.

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
