const deployUnlock = require("../helpers/deployUnlock");
const createLock = require("../helpers/createLock");

contract("Create Lock", (accounts) => {
  const unlockOwner = accounts[9];
  const lockOwner = accounts[0];
  let unlock;

  beforeEach(async () => {
    unlock = await deployUnlock(unlockOwner);
  })

  it("Can create a new Lock", async () => {
    const lock = await createLock(
      unlock, 
      60 * 60 * 24, // expirationDuration (in seconds) of 1 day
      web3.utils.padLeft(0, 40), // tokenAddress for ETH
      web3.utils.toWei("0.01", "ether"), // keyPrice
      100, // maxNumberOfKeys
      "Test Lock", // lockName
      lockOwner
    )

    assert.equal(await lock.methods.name().call(), "Test Lock");
  })
})