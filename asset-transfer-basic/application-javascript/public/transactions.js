var $ = require( "jquery" );
const { signHex } = require('../src/signer.js');
const { prettyJSONString } = require('../src/AppUtil.js');

function getFormAttr(form){
    let tmp = form.querySelector('input[name=args]').value
    tmp = tmp.split(',');
    for (let i=0; i < tmp.length; i++){
        tmp[i] = tmp[i].trim().replace(/^["'](.+(?=["']$))["']$/, '$1');
    }
    return tmp

};

function labelSpinner(label){
    return '<div class="loader"></div><span>'+label+'</span>'
}
$( function() {
    let form = document.querySelector('form[name=submitTX]')
    $(form).submit(function(event){
        event.preventDefault();
        createSignature(form);
    });
});
$( function() {
    let form = document.querySelector('form[name=evaluateTX]');
    $(form).submit(function(event){
        event.preventDefault();
        createQuerySignature(form);
    });
});

var submitDiv;
function createSignature(form){
    let args = getFormAttr(form);
    postResults = document.getElementById("postResults");
    //postResults.insertAdjacentHTML('beforeend',labelSpinner('Build Endorsement'));
    $(postResults).html(labelSpinner('Building Endorsement'));
    $.post('/build_endorsement',{args: args},
        function(data){
            $('#postArgs').html(args.shift()+": "+args);
            const pkey = window.localStorage.getItem(userID);
            const signature = signHex(data,pkey); 
            signEndorsement(signature);
        }
    ).fail(function(error) {console.log(error);})
};

function signEndorsement(signature){
    $(postResults).html(labelSpinner('Signing endorsement'));
    $.post('/sign_endorsement/'+signature,
        function(data){
            const pkey = window.localStorage.getItem(userID);
            const commitSignature = signHex(data,pkey);    
            signCommit(commitSignature);        
        }
    ).fail(function(error){console.log(error)})
};

function signCommit(signature){
    $(postResults).html(labelSpinner('Commiting transaction'));
    $.post('/sign_commit/'+signature,
        function(data){   
            $(postResults).html(data);      
        }).fail(function(error){console.log(error)})
};

var queryResults;
function createQuerySignature(form){
    let args = getFormAttr(form);
    queryResults = document.getElementById("queryResults");
    $(queryResults).html(labelSpinner('Building query'));
    $.get('/build_query',{args: args},
        function(data){
            $('#queryArgs').html(args.shift()+": "+args);
            const pkey = window.localStorage.getItem(userID);
            const signature = signHex(data,pkey);
            signQuery(signature);
        }
    ).fail(function(error) {console.log(error)})
};

function signQuery(signature){
    $(queryResults).html(labelSpinner('Submitting query'));
    $.get('/sign_query/'+signature,
        function(data){
            $(queryResults).html(data);
        }
    ).fail(function(error) {console.log(error)})
};

/*
async function ClientGateway(data){
    const wallet = await buildWallet(SessionWalletStore, 'wallet');
    if(data.new_identity){
        await wallet.put(...new_identity);
    }
    if(data.ccp){
        gateway = GatewaySession.connect(data.ccp,new_identity[0],wallet)
        const network = await gateway.getNetwork(data.channelName);
        contract = network.getContract(data.chaincodeName);
        
    }
    window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        gateway.disconnect();
    });
}
*/