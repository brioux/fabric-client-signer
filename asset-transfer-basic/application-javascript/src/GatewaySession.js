'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewaySession = void 0;

const { Gateway } = require('fabric-network');
const Query = require('../node_modules/fabric-network/lib/impl/query/query');
const { sha256digest } = require('../src/AppUtil.js');

const util = require("util");
//var logger = require('morgan');

class GatewaySession {
    constructor(ccp,user,wallet) {
        this.gateway = new Gateway();
        this.ccp = ccp;
        this.wallet = wallet;
        this.user = user;
    }

    async connect() {
        try{
            await this.gateway.connect(this.ccp, {
                identity: await this.wallet.get(this.user),
                //wallet: this.wallet,
                //identity: this.user,
                clientTlsIdentity: false,
                discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
            });
            this.idx = this.gateway.identityContext;
            //console.log(this.idx);
            this.notice = `Gateway connected for ${this.user}`
            console.log('+++++++++++++++ '+this.notice)
        }catch(error){
            console.error(`Failed to connect gateway : ${error}`)
            throw error;
        } 
    }

    async buildEndorsement(channelName,chaincodeName,args) {

        this.network = await this.gateway.getNetwork(channelName);
        this.contract = this.network.getContract(chaincodeName);
        this.channel = this.network.getChannel();
        this.endorsement = this.channel.newEndorsement(chaincodeName);

        try {
            console.log('+++++++++++++++ Build tx endorsement')
            const tx_params = {fcn: args.shift(), args: args};
            // Sing a new chaincode endorsement
            const endorsementBytes = this.endorsement.build(this.idx , tx_params);

            // return bytes as sha256 hex digest
            return sha256digest(endorsementBytes);
        }catch(error){
            console.error(`Failed to build endorsement: ${error}`);
            throw error;
        }
    }

    async signEndorsement(signature) {
        console.log('+++++++++++++++ Sign tx endorsement')
        this.endorsement.sign(signature);
        const proposalSendRequest =  {
            handler: await this.contract.getDiscoveryHandler(),
            //targets: this.channel.getEndorsers(),
            requestTimeout: 300000
        };
        // Send the signed endorsement requests to ther  peer
        try {
            console.log('+++++++++++++++ Send signed tx endorsement to peers')
            const proposalResponse = await this.endorsement.send(proposalSendRequest);
    
            this.responsePayload = getResponsePayload(proposalResponse);
            this.commit = this.endorsement.newCommit();    
            const commitBytes = this.commit.build(this.idx);
            // return bytes as sha256 hex digest
            return sha256digest(commitBytes)
        }
        catch (err) {
            err.responses = proposalResponse.responses;
            err.errors = proposalResponse.errors;
            console.error(`Tx endorsement failed: ${err}`);
            throw err;
        }
    }

    async commitPayload(signature){
        try {
            console.log('+++++++++++++++ Commit Transaction')
            this.commit.sign(signature);
            const commitSendRequest = {
                handler: await this.contract.getDiscoveryHandler(),
                //targets: this.channel.getCommitters(),
                requestTimeout: 300000                
            };
            // send the signed commit payload to the peer
            const commitResponse = await this.commit.send(commitSendRequest);
            return this.responsePayload;
        }
        catch (error) {
            console.error(`Failed to sign and send final eondorsement commit: ${error}`);
            throw error;
        }        
    }


    async buildQuery(channelName,chaincodeName,args){
        try {
            console.log('+++++++++++++++ Build query')
            this.network = await this.gateway.getNetwork(channelName);
            this.contract = this.network.getContract(chaincodeName);
            this.channel = this.network.getChannel();
            this.queryHandler = this.contract.network.queryHandler;
            this.queryHandler.requestTimeout= 300000;
            //const method = `evaluate[${fcn}]`;
            //logger.debug('%s - start', method);

            this.queryProposal = this.contract.network.getChannel().newQuery(chaincodeName);
            const query_params = {fcn: args.shift(), args: args};
            //logger.debug('%s - build and sign the query', method);
            const queryBytes = this.queryProposal.build(this.idx , query_params);
            // return bytes as sha256 hex digest
            return sha256digest(queryBytes)
        } catch (error) {
            console.error(`Failed to build query offline : ${error}`);
            throw error;
        }
    }

    async evaluateQuery(signature){
        try {
            console.log('+++++++++++++++ Sign and send query to the network')
            this.queryProposal.sign(signature);
            const query = new Query.QueryImpl(this.queryProposal, this.gateway.getOptions().queryHandlerOptions);
            //logger.debug('%s - handler will send', method);
            // send the signed query to the pper for evaluation and return.
            const results = await this.queryHandler.evaluate(query);
            //logger.debug('%s - queryHandler completed', method);
            return results;
        } catch (error) {
            console.error(`Failed to evaluate signed query: ${error}`);
            throw error;
        }
    }

    async disconnect(){this.gateway.disconnect()}
}

function getResponsePayload(proposalResponse) {
    const validEndorsementResponse = getValidEndorsementResponse(proposalResponse.responses);
    if (!validEndorsementResponse) {
        const error = newEndorsementError(proposalResponse);
        throw error;
    }
    return validEndorsementResponse.response.payload;
}
function getValidEndorsementResponse(endorsementResponses) {
    return endorsementResponses.find((endorsementResponse) => endorsementResponse.endorsement);
}
function newEndorsementError(proposalResponse) {
    var _a, _b;
    const errorInfos = [];
    for (const error of proposalResponse.errors) {
        const errorInfo = {
            peer: (_a = error === null || error === void 0 ? void 0 : error.connection) === null || _a === void 0 ? void 0 : _a.name,
            status: 'grpc',
            message: error.message
        };
        errorInfos.push(errorInfo);
    }
    for (const endorsement of proposalResponse.responses) {
        const errorInfo = {
            peer: (_b = endorsement === null || endorsement === void 0 ? void 0 : endorsement.connection) === null || _b === void 0 ? void 0 : _b.name,
            status: endorsement.response.status,
            message: endorsement.response.message
        };
        errorInfos.push(errorInfo);
    }
    const messages = ['No valid responses from any peers. Errors:'];
    for (const errorInfo of errorInfos) {
        messages.push(util.format('peer=%s, status=%s, message=%s', errorInfo.peer, errorInfo.status, errorInfo.message));
    }
    return new Error(messages.join('\n    '));
}
exports.GatewaySession = GatewaySession;


