pragma solidity ^0.5.0;


/**
 * A subset of the PublicLock capabilities for integrating into your contract.
 */
interface IPublicLock
{
  function getHasValidKey(address _account) external view returns (bool);
}
