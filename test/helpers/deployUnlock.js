const unlockAbi = require("unlock-abi-1-1");

module.exports = async function(unlockOwner) {
  const unlockContract = new web3.eth.Contract(unlockAbi.Unlock.abi);
  const instance = await unlockContract
    .deploy({
      data: unlockAbi.Unlock.bytecode
    })
    .send({
      from: unlockOwner,
      gas: 6700000
    });
  return instance;
};
