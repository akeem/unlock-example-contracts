const { protocols } = require("hardlydifficult-test-helpers");
const truffleAssert = require("truffle-assertions");

const MutableLock = artifacts.require("MutableLock");

contract("MutableLock", accounts => {
  const lockOwner = accounts[0];
  const keyOwner = accounts[1];
  const nonKeyOwner = accounts[2];
  let lock;
  let featureContract;

  before(async () => {
    const unlockOwner = accounts[9];
    const unlockProtocol = await protocols.unlock.deploy(web3, unlockOwner);
    const tx = await unlockProtocol.createLock(
      60 * 60 * 24, // expirationDuration (in seconds) of 1 day
      web3.utils.padLeft(0, 40), // tokenAddress for ETH
      web3.utils.toWei("0.01", "ether"), // keyPrice
      100, // maxNumberOfKeys
      "Test Lock", // lockName
      {
        from: lockOwner
      }
    );

    lock = await protocols.unlock.getLock(web3, tx.logs[1].args.newLockAddress);

    // Buy a key from the `keyOwner` account
    await lock.purchaseFor(keyOwner, {
      from: keyOwner,
      value: await lock.keyPrice()
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
      await featureContract.setLock(lock.address, { from: lockOwner });
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
