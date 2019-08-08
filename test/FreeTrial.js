const { protocols } = require("hardlydifficult-test-helpers");
const { time } = require("openzeppelin-test-helpers");

const truffleAssert = require("truffle-assertions");

const FreeTrial = artifacts.require("FreeTrial");

contract("DiceRoleModifier", accounts => {
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

    featureContract = await FreeTrial.new(lock.address);
  });

  it("Any account can use the feature the first time", async () => {
    await featureContract.exampleFeature({
      from: keyOwner
    });
    await featureContract.exampleFeature({
      from: nonKeyOwner
    });
  });

  it("The key owner can keep using the feature!", async () => {
    for (let i = 0; i < 100; i++) {
      await featureContract.exampleFeature({
        from: keyOwner
      });
    }
  });

  it("Non-key owners cannot use the feature again right away", async () => {
    await truffleAssert.fails(
      featureContract.exampleFeature({
        from: nonKeyOwner
      }),
      truffleAssert.ErrorType.REVERT,
      "Limited to one call per day, unless you purchase a Key!"
    );
  });

  describe("after 24 hours", () => {
    before(async () => {
      await time.increase(time.duration.days(1));
    });

    it("Non-key owners can use the feature one more time", async () => {
      await featureContract.exampleFeature({
        from: nonKeyOwner
      });
    });

    it("And then Non-key owners cannot use the feature again right away", async () => {
      await truffleAssert.fails(
        featureContract.exampleFeature({
          from: nonKeyOwner
        }),
        truffleAssert.ErrorType.REVERT,
        "Limited to one call per day, unless you purchase a Key!"
      );
    });
  });
});
