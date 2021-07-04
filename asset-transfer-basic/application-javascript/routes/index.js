var express = require('express');
var router = express.Router();

const { enrollUser } = require('../src/CAUtil.js')
const { GatewaySession } = require('../src/GatewaySession.js')
const { prettyJSONString, bufferUnit8Array } = require('../src/AppUtil.js');
const { signHex } = require('../src/signer.js');
var signature;
router.param('signature', async function(req, res, next, _signature){
    console.log(_signature);
    // now we have the signature as hex
    // convert signature to Uint8Array bytes to submit tx payload to peer
        signature = bufferUnit8Array(_signature);
    try{
        next();
    }catch(error){
        res.render('index', {error: error});
    }
}); 

router.get('/', async function (req, res,) {
    res.render('index', { 
        text: 'Wallet Example'
    })
})

const { buildCCPOrg1 } = require('../src/AppUtil.js');
// create new user
router.post('/register',async function (req, res) {
    const { user } = req.body;
    let wallet = await enrollUser(user);
    //const { user, csr } = req.body;
    //let wallet = await enrollUser(user,csr);
    let data = {};

    data.ccp = buildCCPOrg1();
    
    global.gatewaySession = new GatewaySession(data.ccp,user,wallet);
    data.user = user
    data.identity = await wallet.get(user);
    try{
        await gatewaySession.connect();
        data.gatewayNotice = gatewaySession.notice;
        res.render('index',{data: data})
    }catch(error){
        res.render('error', {error: error})
    }
})

// create new user
router.post('/build_endorsement',async function (req, res, next) {
    let {args} = req.body;
    try{
        console.log(args)
        let endorsementHex = await gatewaySession.buildEndorsement(channelName,chaincodeName,args);
        res.end(endorsementHex);
    }catch(error){ 
        console.log(error)
        //res.end(error);
    }     
})

router.post('/sign_endorsement/:signature',async function (req, res,next) {
    try{
        let commitHex = await gatewaySession.signEndorsement(signature);
        res.end(commitHex);
    }catch(error){ 
        console.log(error)
        //res.end(error);
    } 
})

router.post('/sign_commit/:signature',async function (req, res,next) {
    try{
        let result = await gatewaySession.commitPayload(signature);
        console.log(result);
        result = `${prettyJSONString(result.toString())}`
        res.end('Success');
    }catch(error){ 
        console.log(error)
        //res.end(error);
    } 
})

router.get('/build_query',async function (req, res,next) {
    try{ 
        let {args} = req.query;
        let queryHex = await gatewaySession.buildQuery(channelName,chaincodeName,args);
        res.end(queryHex);
    }catch(error){ 
        console.log(error)
        //res.end(error);
    }   
})
router.get('/sign_query/:signature',async function (req, res, next) {
    try{
        let result = await gatewaySession.evaluateQuery(signature);
        result = `${prettyJSONString(result.toString())}`
        res.end(result);
    }catch(error){ 
        console.log(error)
        //res.end(error);
    }
})

module.exports = router;


