const deployUnlock = require("../helpers/deployUnlock");
const createLock = require("../helpers/createLock");

contract("Purchase a key", (accounts) => {
  const unlockOwner = accounts[9];
  const lockOwner = accounts[0];
  let lock;

  beforeEach(async () => {
    const unlock = await deployUnlock(unlockOwner);
    lock = await createLock(
      unlock, 
      60 * 60 * 24, // expirationDuration (in seconds) of 1 day
      web3.utils.padLeft(0, 40), // tokenAddress for ETH
      web3.utils.toWei("0.01", "ether"), // keyPrice
      100, // maxNumberOfKeys
      "Test Lock", // lockName
      lockOwner
    )
  })

  it("Can buy a key", async () => {
    const keyOwner = accounts[1];
    const tx = await lock.methods.purchaseFor(keyOwner).send({
      from: keyOwner,
      value: await lock.methods.keyPrice().call(),
      gas: 6700000
    })

    assert.equal(tx.events.Transfer.returnValues._tokenId, 1);
    assert.equal(await lock.methods.getHasValidKey(keyOwner).call(), true);
  })
})