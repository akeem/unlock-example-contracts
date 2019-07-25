const unlockAbi = require("unlock-abi-1-1");

module.exports = async function(
  unlock, 
  expirationDuration, 
  tokenAddress, 
  keyPrice, 
  maxNumberOfKeys, 
  lockName,
  lockOwner
) {
  const tx = await unlock.methods.createLock(
    expirationDuration,
    tokenAddress,
    keyPrice,
    maxNumberOfKeys,
    lockName
  ).send({
    from: lockOwner,
    gas: 6700000
  });

  const instance = new web3.eth.Contract(
    unlockAbi.PublicLock.abi,
    tx.events.NewLock.returnValues.newLockAddress
  );
  return instance;
};
