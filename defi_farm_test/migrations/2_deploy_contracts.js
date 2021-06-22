const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {
  //deploy Dai
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  //deploy Dapp
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  //deploy Farm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  //transfers DappTokens to TokenFarm
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // transfer mock dai to investors
  await daiToken.transfer(accounts[1], '100000000000000000000')
  await daiToken.transfer(accounts[2], '100000000000000000000')
  await daiToken.transfer(accounts[3], '100000000000000000000')
};
