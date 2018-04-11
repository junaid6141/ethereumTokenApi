//This module help to listen request
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({type: 'application/json'}));


var toAddress = '';
var fromAddress = '';
var ContractAddress = '';
var privateKey = '';
var tokenValue = '';


const Web3 = require("web3");
const web3 = new Web3();
const Tx = require("ethereumjs-tx");
var Web3EthAccounts = require('web3-eth-accounts');

web3.setProvider(new web3.providers.HttpProvider("https://mainnet.infura.io/t2utzUdkSyp5DgSxasQX"));

var abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"INITIAL_SUPPLY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"wallet","type":"address"},{"name":"buyer","type":"address"},{"name":"tokenAmount","type":"uint256"}],"name":"pullBack","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"showMyTokenBalance","outputs":[{"name":"tokenBalance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wallet","type":"address"},{"name":"buyer","type":"address"},{"name":"tokenAmount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"wallet","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"number","type":"uint256"}],"name":"Debug","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"}];
var contractAddress = "0xaFBeC4D65BC7b116d85107FD05d912491029Bf46"; 
var contract =  web3.eth.contract(abi).at(contractAddress);

var createAccount = express.Router();
createAccount.get('/', function(request, response){
    // Enter your infura key
    var account = new Web3EthAccounts('http://mainnet.infura.io/t2utzUdkSyp5DgSxasQX');

    response.contentType('application/json');
    response.end(JSON.stringify(account.create()));
});
app.use('/create', createAccount);


var getBalance = express.Router();
getBalance.post('/', function(request , response){

    var toAddress = request.body.toAddress;
    response.contentType('application/json');
    response.end(JSON.stringify(contract.balanceOf(toAddress)));

});
app.use('/balance', getBalance);


var sendToken = express.Router();
sendToken.post('/', async function(request, response){
    
    
    fromAddress = request.body.from_address;
    privateKey = request.body.from_private_key;
    toAddress = request.body.to_address;
    tokenValue = request.body.token_value;

    tokenValue = web3.toWei(tokenValue, 'ether');

    web3.eth.defaultAccount = fromAddress;
    var count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
    var data = contract.transfer.getData(toAddress, tokenValue);
    var gasPrice = web3.eth.gasPrice;
    var gasLimit = 90000;
    var rawTransaction = {
        "from": fromAddress,
        "nonce": web3.toHex(count),
        "gasPrice": web3.toHex(gasPrice),
        "gasLimit": web3.toHex(gasLimit),
        "to": contractAddress,
        "data": data,
        "chainId": 0x01
    };
    var privKey = new Buffer(privateKey, 'hex');
    var tx = new Tx(rawTransaction);

    tx.sign(privKey);
    var serializedTx = tx.serialize();

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



var sendEther = express.Router();
sendEther.post('/', async function(request, response){
    
    
    fromAddress = request.body.from_address;
    privateKey = request.body.from_private_key;
    toAddress = request.body.to_address;
    etherValue = request.body.ether_value;

    etherValue = web3.toWei(etherValue, 'ether');

    web3.eth.defaultAccount = fromAddress;
    var count = web3.eth.getTransactionCount(web3.eth.defaultAccount);
    var gasPrice = web3.eth.gasPrice;
    var gasLimit = 21000;
    var rawTransaction = {
        "from": fromAddress,
        "nonce": web3.toHex(count),
        "gasPrice": web3.toHex(gasPrice),
        "gasLimit": web3.toHex(gasLimit),
        "to": toAddress,
        "value": web3.toHex(etherValue),
        "chainId": 0x01
    };
    var privKey = new Buffer(privateKey, 'hex');
    var tx = new Tx(rawTransaction);

    tx.sign(privKey);
    var serializedTx = tx.serialize();

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
