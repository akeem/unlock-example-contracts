pragma solidity ^0.5.0;

import 'hardlydifficult-ethereum-contracts/contracts/interfaces/IPublicLock.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';


/**
 * An example where the Lock used may be changed (or removed) by the owner.
 */
contract MutableLock is Ownable
{
  IPublicLock public lock;

  function setLock(IPublicLock _lockAddress) public onlyOwner
  {
    lock = _lockAddress;
  }

  function paidOnlyFeature() public
  {
    // If there is no lock assigned, we can't require they bought a key!
    require(address(lock) == address(0) || lock.getHasValidKey(msg.sender), 'Purchase a key first!');
    // Then implement your feature as normal
  }
}
