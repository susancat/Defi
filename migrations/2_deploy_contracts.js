const DappToken = artifacts.require("DappToken")
const DaiToken = artifacts.require("DaiToken")
const TokenFarm = artifacts.require("TokenFarm")

module.exports = async function(deployer, network, accounts) {
    //deploy Mock DAI token
    await deployer.deploy(DaiToken)
    const daiToken = await DaiToken.deployed()

    //deploy Dapp token
    await deployer.deploy(DappToken)
    const dappToken = await DappToken.deployed()

    //deploy tokenFarm, parameters come from contract
    await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
    const tokenFarm = await TokenFarm.deployed()

    //the mechanism of tokenFarm is to put Dai token in the farm(investors put), and also assign dapp token in the farm (investor can earn as intersts)
    //tokenFarm works as a liquid pool to distribute all the tokens

    //transfer all dapp tokens to tokenFarm
    await dappToken.transfer(tokenFarm.address, '1000000000000000000000000') //it's 1 million total supply * 18 decimal

    //transfer 100 mock dai token from deployer to investor (from 1st to 2nd account in ganache)
    await daiToken.transfer(accounts[1], '100000000000000000000')
};