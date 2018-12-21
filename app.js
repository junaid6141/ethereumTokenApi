var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Web3EthAccounts = require('web3-eth-accounts');

const Web3 = require("web3");
const web3 = new Web3();
const Tx = require("ethereumjs-tx");

app.use(bodyParser.json({type: 'application/json'}));
web3.setProvider(new web3.providers.HttpProvider("https://mainnet.infura.io/'Add your Infura Key'"));

var abi = "Add contract ABI without quotes";
var contractAddress = "Add contract address"; 
var contract =  web3.eth.contract(abi).at(contractAddress);

//------- Create Account ---------

var createAccount = express.Router();
createAccount.get('/', function(request, response){
    
    let account = new Web3EthAccounts('http://mainnet.infura.io/"Add your Infura Key"');

    response.contentType('application/json');
    response.end(JSON.stringify(account.create()));
});
app.use('/create', createAccount);

//------- Get Account Balance ---------

var getBalance = express.Router();
getBalance.post('/', function(request , response){

    let toAddress = request.body.toAddress;
    response.contentType('application/json');
    response.end(JSON.stringify(contract.balanceOf(toAddress)));

});
app.use('/balance', getBalance);

//------- Send Token ---------

var sendToken = express.Router();
sendToken.post('/', async function(request, response){
    
    let fromAddress = request.body.from_address;
    let privateKey = request.body.from_private_key;
    let toAddress = request.body.to_address;
    let tokenValue = request.body.token_value;

    tokenValue = web3.toWei(tokenValue, 'ether');

    web3.eth.defaultAccount = fromAddress;
    let count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
    let data = contract.transfer.getData(toAddress, tokenValue);
    let gasPrice = web3.eth.gasPrice;
    let gasLimit = 90000;
    let rawTransaction = {
        "from": fromAddress,
        "nonce": web3.toHex(count),
        "gasPrice": web3.toHex(gasPrice),
        "gasLimit": web3.toHex(gasLimit),
        "to": contractAddress,
        "data": data,
        "chainId": 0x01
    };
    let privKey = new Buffer(privateKey, 'hex');
    let tx = new Tx(rawTransaction);

    tx.sign(privKey);
    let serializedTx = tx.serialize();

    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err){
            console.log(hash);
            response.contentType('application/json');
            response.end(JSON.stringify(hash));
        }
        else{
            console.log(err);
        }
    });
});
app.use('/transferToken', sendToken);

//------- Send Ether ---------

var sendEther = express.Router();
sendEther.post('/', async function(request, response){
     
    let fromAddress = request.body.from_address;
    let privateKey = request.body.from_private_key;
    let toAddress = request.body.to_address;
    let etherValue = request.body.ether_value;

    etherValue = web3.toWei(etherValue, 'ether');

    web3.eth.defaultAccount = fromAddress;
    let count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
    let gasPrice = web3.eth.gasPrice;
    let gasLimit = 21000;
    let rawTransaction = {
        "from": fromAddress,
        "nonce": web3.toHex(count),
        "gasPrice": web3.toHex(gasPrice),
        "gasLimit": web3.toHex(gasLimit),
        "to": toAddress,
        "value": web3.toHex(etherValue),
        "chainId": 0x01
    };
    let privKey = new Buffer(privateKey, 'hex');
    let tx = new Tx(rawTransaction);

    tx.sign(privKey);
    let serializedTx = tx.serialize();

    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err){
            console.log(hash);
            response.contentType('application/json');
            response.end(JSON.stringify(hash));
        }
        else{
            console.log(err);
        }
    });
});
app.use('/transferEther', sendEther);


app.get('/', function(request, response){
    
    response.contentType('application/json');
    response.end(JSON.stringify("Node is running"));
});

if (module === require.main) {
    // Start the server
    var server = app.listen(process.env.PORT || 3000, function () {
        var port = server.address().port;
        console.log('App listening on port %s', port);
    });
}
module.exports = app;
