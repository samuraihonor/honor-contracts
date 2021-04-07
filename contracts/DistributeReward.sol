pragma solidity 0.6.12;

import "./libs/IBEP20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract DistributeReward {
    using SafeMath for uint256;
    
    address public marketing;
    address public owner;
    address public mods;
    address public dev;
    IBEP20 public honor;

    constructor(
        address _honor,
        address _marketing,
        address _mods,
        address _dev,
        address _owner
    ) public {
        honor = IBEP20(_honor);
        marketing = _marketing;
        mods = _mods;
        dev = _dev;
        owner = _owner;
    }

    function distribute() external {
        uint256 balance = IBEP20(honor).balanceOf(address(this));
        uint256 devReward = balance.mul(400).div(888);
        uint256 marKetingReward = balance.mul(200).div(888);
        uint256 modsReward =  balance.mul(100).div(888);
        uint256 ownerReward =  ((balance.sub(marKetingReward)).sub(devReward)).sub(modsReward);
        honor.transfer(marketing, marKetingReward);
        honor.transfer(owner, ownerReward);
        honor.transfer(mods, modsReward);
        honor.transfer(dev, devReward);
    }   
}
