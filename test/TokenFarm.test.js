const { assert } = require('chai')
//test will go through the whole work flow
const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n,'ether');
}
contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm
    before(async() => {
        //load Contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //Transfer all Dapp tokens to farm(1 million)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        //send tokens to investor, investor equals to accounts[1], owner equals to accounts[0]
        await daiToken.transfer(investor, tokens('100'), { from: owner })
    })
    //check if the contract deployed properly by comparing their name()
    describe('Mock DAI deployment', async() => {
        it('has a name', async() => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token deployment', async() => {
        it('has a name', async() => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async() => {
        it('has a name', async() => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async() => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })
    //test the function stakeTokens in TokenFarm.sol
    describe('Farming tokens', async() => {
        it('rewards investors for staking mDai tokens', async() => {
            let result
            //check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

            //tell DAI token contract tokenFarm allow to spend tokens
            await daiToken.approve(tokenFarm.address,tokens('100'), { from: investor} )
            //transfer DAI from investor
            await tokenFarm.stakeTokens(tokens('100'), { from: investor })

            //check staking results for investor and tokenFarm after transfer
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')
      
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')
      
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')
      
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')
            //---------------------------//
            //test issue token function
            await tokenFarm.issueTokens({ from: owner })
            //check the balances after issue
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor DApp token wallet balance correct after issuing')
            //only owner can issue tokens, so investor's issueToken request should be rejected
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            // Unstake tokens
            await tokenFarm.unstakeTokens({ from: investor })

            // Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
        })
    })
})