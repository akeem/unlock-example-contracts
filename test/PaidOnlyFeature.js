const { constants, protocols } = require("hardlydifficult-test-helpers");
const truffleAssert = require("truffle-assertions");

const PaidOnlyFeature = artifacts.require("PaidOnlyFeature");

contract("PaidOnlyFeature", accounts => {
  const lockOwner = accounts[0];
  const keyOwner = accounts[1];
  const nonKeyOwner = accounts[2];
  let lock;
  let featureContract;

  beforeEach(async () => {
    const unlockOwner = accounts[9];
    const unlockProtocol = await protocols.unlock.deploy(web3, unlockOwner);
    const tx = await unlockProtocol.methods
      .createLock(
        60 * 60 * 24, // expirationDuration (in seconds) of 1 day
        web3.utils.padLeft(0, 40), // tokenAddress for ETH
        web3.utils.toWei("0.01", "ether"), // keyPrice
        100, // maxNumberOfKeys
        "Test Lock" // lockName
      )
      .send({
        from: lockOwner,
        gas: constants.MAX_GAS
      });

    lock = protocols.unlock.getLock(
      tx.events.NewLock.returnValues.newLockAddress
    );

    // Buy a key from the `keyOwner` account
    await lock.methods.purchaseFor(keyOwner).send({
      from: keyOwner,
      value: await lock.methods.keyPrice().call(),
      gas: 6700000
    });

    featureContract = await PaidOnlyFeature.new(lock._address);
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
