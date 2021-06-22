const { assert } = require('chai')
const { default: Web3 } = require('web3')
const _deploy_contracts = require('../migrations/2_deploy_contracts')

const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
    .use(require('chai-as-promised'))
    .should() 

contract('TokenFarm', (accounts) => {
    let daiToken, dappToken, tokenFarm

    before(async () => {
        //load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //transfer tokens
        await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

        //transfer to investors
        await daiToken.transfer(accounts[1], '100', { from: accounts[0] })
        await daiToken.transfer(accounts[2], '100', { from: accounts[0] })
        await daiToken.transfer(accounts[3], '100', { from: accounts[0] })
    })

    //write tests here
    describe('Mock DAI deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })
    describe('Mock DAPP deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    }) 

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), '1000000000000000000000000')
        })
    })

    describe('Farming tokens', async () => {

        it('rewards users for staking mDai tokens', async () => {
            let result

            //check user balance before staking
            result = await daiToken.balanceOf(accounts[1])
            assert.equal(result.toString(), '100', 'investor Mock DAI wallet balance correct for staking')

            //approve and stake tokens
            await daiToken.approve(tokenFarm.address, '100', { from: accounts[1]} )
            await tokenFarm.stakeTokens('100', { from: accounts[1] })

            //check staking result of wallet
            result = await daiToken.balanceOf(accounts[1])
            assert.equal(result.toString(), '0', 'user Mock DAI wallet balance correct after staking')

            //check staking result of contract
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), '100', 'Token Farm Mock DAI balance correct after staking')

            //user balance correct before staking
            result = await tokenFarm.stakingBalance(accounts[1])
            assert.equal(result.toString(), '100', 'user staking balance correct after staking')

            result = await tokenFarm.isStaking(accounts[1])
            assert.equal(result.toString(), 'true', 'user staking status correct after staking')

            //issue rewards
            await tokenFarm.issueRewards({ from: accounts[0] })

            //check balance after issuance
            result = await dappToken.balanceOf(accounts[1])
            assert.equal(result.toString(), '100', 'user Dapp Token wallet balance correct after issuance')
            
            //ensure only owner can issure tokens
            await tokenFarm.issueRewards({ from: accounts[1] }).should.be.rejected;

            //unstake tokens
            await tokenFarm.unstakeTokens({ from: accounts[1] })

            //check results
            result = await daiToken.balanceOf(accounts[1])
            assert.equal(result.toString(), '100', 'user Mock DAI wallet balance corect after staking')

            //check token farm contract balance
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), '0', 'Token Farm Mock DAI balance correct after staking')
            
            //check if user is staking
            result = await tokenFarm.isStaking(accounts[1])
            assert.equal(result.toString(), 'false', 'user staking status correct after staking')
        })
    })

})