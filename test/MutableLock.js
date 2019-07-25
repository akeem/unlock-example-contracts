const truffleAssert = require("truffle-assertions");
const deployUnlock = require("./helpers/deployUnlock");
const createLock = require("./helpers/createLock");

const MutableLock = artifacts.require("MutableLock");

contract("MutableLock", accounts => {
  const lockOwner = accounts[0];
  const keyOwner = accounts[1];
  const nonKeyOwner = accounts[2];
  let lock;
  let featureContract;

  before(async () => {
    const unlockOwner = accounts[9];
    const unlock = await deployUnlock(unlockOwner);
    lock = await createLock(
      unlock,
      60 * 60 * 24, // expirationDuration (in seconds) of 1 day
      web3.utils.padLeft(0, 40), // tokenAddress for ETH
      web3.utils.toWei("0.01", "ether"), // keyPrice
      100, // maxNumberOfKeys
      "Test Lock", // lockName
      lockOwner
    );

    // Buy a key from the `keyOwner` account
    await lock.methods.purchaseFor(keyOwner).send({
      from: keyOwner,
      value: await lock.methods.keyPrice().call(),
      gas: 6700000
    });

    featureContract = await MutableLock.new();
  });

  it("Anyone can call the feature when no lock is assigned", async () => {
    await featureContract.paidOnlyFeature({
      from: keyOwner
    });
    await featureContract.paidOnlyFeature({
      from: nonKeyOwner
    });
  });

  describe("When a lock is assigned", () => {
    before(async () => {
      await featureContract.setLock(lock._address, { from: lockOwner });
    });

    it("Key owner can call the function", async () => {
      await featureContract.paidOnlyFeature({
        from: keyOwner
      });
    });

    it("A call from a non-key owning account will revert", async () => {
      await truffleAssert.fails(
        featureContract.paidOnlyFeature({
          from: nonKeyOwner
        }),
        truffleAssert.ErrorType.REVERT,
        "Purchase a key first!"
      );
    });
  });
});
