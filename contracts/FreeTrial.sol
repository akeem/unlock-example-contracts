pragma solidity ^0.5.0;

import './IPublicLock.sol';

/**
 * An example of a free trial, allowing any account to issue up to 1 tx per day.
 * Purchase a key for unlimited transactions!
 */
contract FreeTrial
{
  IPublicLock public lock;
  mapping(address => uint256) accountToLastUse;

  constructor(IPublicLock _lockAddress) public
  {
    lock = _lockAddress;
  }

  function exampleFeature() public
  {
    if(!lock.getHasValidKey(msg.sender))
    {
      require(accountToLastUse[msg.sender] + 24 hours < block.timestamp, 'Limited to one call per day, unless you purchase a Key!');
    }
    accountToLastUse[msg.sender] = block.timestamp;
    // Then implement your feature as normal
  }
}
