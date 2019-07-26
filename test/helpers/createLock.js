const { constants, protocols } = require("hardlydifficult-test-helpers");

module.exports = async function(
  expirationDuration,
  tokenAddress,
  keyPrice,
  maxNumberOfKeys,
  lockName,
  unlockOwner,
  lockOwner
) {
  const unlockProtocol = await protocols.unlock.deploy(web3, unlockOwner);
  const tx = await unlockProtocol.methods
    .createLock(
      expirationDuration,
      tokenAddress,
      keyPrice,
      maxNumberOfKeys,
      lockName
    )
    .send({
      from: lockOwner,
      gas: constants.MAX_GAS
    });

  return protocols.unlock.getLock(
    tx.events.NewLock.returnValues.newLockAddress
  );
};
