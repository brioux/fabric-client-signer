#!/bin/bash
sh ./network.sh down  
sh ./network.sh up createChannel -c mychannel -ca
sh ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript