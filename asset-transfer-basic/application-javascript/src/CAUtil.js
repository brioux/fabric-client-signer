/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

/**
 *
 * @param {*} FabricCAServices
 * @param {*} ccp
 */

let ADMIN_USER_ID = 'admin'
let ADMIN_USER_PSWD = 'adminpw'

var logger = require('morgan');
const path = require('path');

require

const { Gateway, Wallets } = require('fabric-network');

const FabricCAServices = require('fabric-ca-client');
const { buildCCPOrg1, buildWallet, prettyJSONString } = require('./AppUtil.js');
const { GatewaySession } = require('./GatewaySession.js')

const ccp = buildCCPOrg1();

// the information in the network configuration
const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

exports.getAdmin = async (wallet) => {

    // setup the wallet to hold the credentials of the application user
    if(wallet==null){wallet = await buildWallet(Wallets, walletPath)};
    // in a real application this would be done on an administrative flow, and only once
    await enrollAdmin(caClient, wallet, mspOrg1);
    return wallet;
}
exports.enrollUser = async (user,csr=null) => {
    // setup the wallet to hold the credentials of the application user

    let wallet = await buildWallet(Wallets, walletPath);

    await registerAndEnrollUser(caClient, wallet, mspOrg1, user, csr, 'org1.department1');
    return wallet;
}


function buildCAClient(FabricCAServices, ccp, caHostName) {
    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities[caHostName]; //lookup CA details from config
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    console.log(`Built a CA Client named ${caInfo.caName}`);
    return caClient;
};

async function enrollAdmin(caClient, wallet, orgMspId) {
    try {
        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get(ADMIN_USER_ID);
        if (identity) {
            console.log('An identity for the admin user already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await caClient.enroll({ enrollmentID: ADMIN_USER_ID, enrollmentSecret: ADMIN_USER_PSWD });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: 'X.509',
        };
        await wallet.put(ADMIN_USER_ID, x509Identity);
        console.log('Successfully enrolled admin user and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to enroll admin user : ${error}`);
    }
};

async function registerAndEnrollUser(caClient, wallet, orgMspId, userId, csr, affiliation) {
    try {
        // Check to see if we've already enrolled the user
        // using a client side wallet - sos server cnat easily check this.
        // can check if an identity has already been passed by the client
        //const userIdentity = await wallet.get(userId);
        //if (userIdentity) {
        //    console.log(`An identity for the user ${userId} already exists in the wallet`);
        //    return;
        //}
        // Check to see if we've already enrolled the user
        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            console.log(`An identity for the user ${userId} already exists in the wallet`);
            return userIdentity;
        }

        // Must use an admin to register a new user
        const adminIdentity = await wallet.get(ADMIN_USER_ID);
        if (!adminIdentity) {
            console.log('An identity for the admin user does not exist in the wallet');
            console.log('Enroll the admin user before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, ADMIN_USER_ID);

        // Register the user, enroll the user, and import the new identity into the wallet.
        // if affiliation is specified by client, the affiliation value must be configured in CA
        const secret = await caClient.register({
            affiliation: affiliation,
            enrollmentID: userId,
            role: 'client'
        }, adminUser);

        const enrollment = await caClient.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret,
            csr: csr
        });
        console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
        if(csr){
           console.log(csr);
            //we need to implment a different identity provider/type than X.509 cause 
            // the user has enrolled with a privately signed csr
            // and the key is no longer avilable within the client app
        }else{
            const X509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: orgMspId,
                type: 'X.509',
            };
            await wallet.put(userId, X509Identity);
            return X509Identity;
        }
        //const walletStore = new ClientWalletStore();
        //const wallet = new Wallet(walletStore);
        // walletStore is on the client so do we really need to create a custom wallet store instance?


    } catch (error) {
        console.error(`Failed to register user : ${error}`);
    }
};
