pragma solidity ^0.5.0;

import './IPublicLock.sol';

/**
 * An example paid-only feature, unlocked by purchasing a key.
 */
contract PaidOnlyFeature
{
  IPublicLock public lock;

  constructor(IPublicLock _lockAddress) public
  {
    lock = _lockAddress;
  }

  function paidOnlyFeature() public
  {
    require(lock.getHasValidKey(msg.sender), 'Purchase a key first!');
    // Then implement your feature as normal
  }
}
