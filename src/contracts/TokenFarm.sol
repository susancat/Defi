pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";
//gain the above two contract address and pass them here
contract TokenFarm {
    string public name = "Dapp Token Farm";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;

    //when a new investor deposit token, put address into an array. this helps to know who can get the token back and interest, so NO DUPLICATION
    address[] public stakers;
    //for updating or grab the value of the key
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor (DappToken _dappToken, DaiToken _daiToken) public{
        dappToken = _dappToken;//_dappToken and _daitoken are local var
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //1. stakes tokens(investor deposit), can use transferFrom(from, to, value) function from openZeppelin ERC20 contract template
    //'this' address is tokenFarm contract's address
    function stakeTokens(uint _amount) public {
        //require investors have more than 0 daiToken in their wallet
        require(_amount > 0, "amount cannot not be 0");

        daiToken.transferFrom(msg.sender, address(this), _amount);

        //updating staking balance after transfer
        stakingBalance[msg.sender] += _amount;

        //add investor to stakers array 'only' if they haven't staked (false) before
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);//prevent duplicated investor get token TWICE
        }

        //updating the staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    //2. unstaking tokens(withdraw tokens to investors' account address)
    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, "staking balance cannot be 0");
        //transfer all daiToken (balance) to the investor
        daiToken.transfer(msg.sender, balance);

        //reset the balance in the tokenFarm to 0
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
        //but no need to pop it out from stakers array?
    }

    //3. issuing tokens
    function issueTokens() public {
    //need to declare that owner euqals to sender in constructor
        require(msg.sender == owner, "caller must be the owner");
        for(uint i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            //get balance value by key address
            uint balance = stakingBalance[recipient];
            //give token out from tokenFarm to investor by dapp as interests
            if(balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }
}