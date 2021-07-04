//stores the current user to request private key for signing transactions to the Fabric gateway
var userID; 

function storePrivateKey(data){
    let pkey = getNested(data, 'identity','credentials','privateKey');
    userID = getNested(data, 'user');
    if(userID && pkey){
        //document.getElementById("result").html(prettyJSONString(result));
        window.localStorage.setItem(userID,pkey);
    }
    pkey = null;

    function getNested(obj, ...args) {
      return args.reduce((obj, level) => obj && obj[level], obj)
    }
};
