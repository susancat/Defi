pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";
//gain the above two contract address and pass them here
contract TokenFarm {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;

    constructor (DappToken _dappToken, DaiToken _daiToken) public{
        dappToken = _dappToken;//_dappToken and _daitoken are local var
        daiToken = _daiToken;
    }
}