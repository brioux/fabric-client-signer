/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

 /**
 * Required External Modules
 */
'use strict';
const path = require('path');

var createError = require('http-errors');
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const env = require('dotenv').config();

var logger = require('morgan');

global.site = {title: 'Fabric Client Signer'};
global.author = {
    name: 'Bertrand Rioux',
    contact: 'bertrand.rioux@gmail.com'
}

var indexRouter = require('./routes/index');

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// for parsing multipart/form-data
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


global.channelName= 'mychannel';
global.chaincodeName= 'basic';
global.mspOrg1= 'Org1MSP';

global.walletPath = path.join(__dirname, 'wallet');

const { getAdmin, enrollUser } = require('./src/CAUtil.js')
const { GatewaySession } = require('./src/GatewaySession.js')
const { buildCCPOrg1, prettyJSONString, bufferUnit8Array} = require('./src/AppUtil.js');
const { signHex } = require('./src/signer.js');
async function main() {
    let wallet = await getAdmin();
	//let user = 'bor';
    //const fs = require('fs');
    //const csr = fs.readFileSync('test.csr', 'utf8');


/*
    await enrollUser(user,wallet);
    let ccp = buildCCPOrg1();
    let gatewaySession = new GatewaySession(ccp,user,wallet);
    await gatewaySession.connect();

    let identity = await wallet.get(user);
    const pkey = identity.credentials.privateKey;

    var signature;
    var result;


//    let endorsementHex = await gatewaySession.buildEndorsement(channelName,chaincodeName,['InitLedger']);
    let endorsementHex = await gatewaySession.buildEndorsement(channelName,chaincodeName,['UpdateAsset','asset1', 'blue', '5', 'Tomoko', '43']);
    signature = bufferUnit8Array(signHex(endorsementHex,pkey))
    console.log('singing endorsement');
    console.log(signature)
    let commitHex = await gatewaySession.signEndorsement(signature);

    console.log('commit payload');
    signature = bufferUnit8Array(signHex(commitHex,pkey))
    result = await gatewaySession.commitPayload(signature);


    let queryHex = await gatewaySession.buildQuery(channelName,chaincodeName,['GetAllAssets']);
    signature = bufferUnit8Array(signHex(queryHex,pkey))
    result = await gatewaySession.evaluateQuery(signature);

    console.log(`${prettyJSONString(result.toString())}`);

    const network = await gatewaySession.gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    
    //result = await contract.evaluateTransaction('GetAllAssets');
    result = await contract.evaluateTransaction('ReadAsset', 'asset1');
    console.log(`${prettyJSONString(result.toString())}`);

    gatewaySession.disconnect();
*/
}

main();
