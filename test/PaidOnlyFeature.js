const { protocols } = require("hardlydifficult-ethereum-contracts");
const truffleAssert = require("truffle-assertions");
const PaidOnlyFeature = artifacts.require("PaidOnlyFeature");

contract("PaidOnlyFeature", accounts => {
  let lock;
  let featureContract;
  const keyOwner = accounts[3];
  const nonKeyOwner = accounts[4];

  beforeEach(async () => {
    lock = await protocols.unlock.createTestLock(
      web3,
      accounts[9], // Unlock Protocol owner
      accounts[1], // Lock owner
      {
        keyPrice: web3.utils.toWei("0.01", "ether")
      }
    );

    // Deploy the feature contract and pass the lock's contract address
    featureContract = await PaidOnlyFeature.new(lock.address);

    // Buy a key for the `keyOwner` account
    await lock.purchaseFor(keyOwner, {
      from: keyOwner,
      value: await lock.keyPrice()
    });
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
