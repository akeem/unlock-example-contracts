const unlockAbi = require("unlock-abi-1-1");

module.exports = async function(
  expirationDuration,
  tokenAddress,
  keyPrice,
  maxNumberOfKeys,
  lockName,
  unlockOwner,
  lockOwner
) {
  // For testing locally, we deploy a new Unlock contract
  const unlockContract = new web3.eth.Contract(unlockAbi.Unlock.abi);
  const unlock = await unlockContract
    .deploy({
      data: unlockAbi.Unlock.bytecode
    })
    .send({
      from: unlockOwner,
      gas: 6700000
    });

  // And use that to create a new Lock
  const tx = await unlock.methods
    .createLock(
      expirationDuration,
      tokenAddress,
      keyPrice,
      maxNumberOfKeys,
      lockName
    )
    .send({
      from: lockOwner,
      gas: 6700000
    });

  const lock = new web3.eth.Contract(
    unlockAbi.PublicLock.abi,
    tx.events.NewLock.returnValues.newLockAddress
  );
  return lock;
};
