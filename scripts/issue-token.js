const TokenFarm = artifacts.require("TokenFarm")

module.exports = async function(callback) {
    let tokenFarm = await TokenFarm.deployed()
    await tokenFarm.issueTokens()
    //then truffle migrate --reset
    //truffle exec scripts/issue-token.js
    //to test the issue token functions
    console.log('Tokens issued!')
    callback()
};

