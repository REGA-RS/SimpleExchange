// 
// MIT License
// 
// Copyright (c) 2018 REGA Risk Sharing
//   
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
// Author: Sergei Sevriugin
// Version: 0.0.1
//  

pragma solidity ^0.4.17;

import "./Utils.sol";
import "./Owned.sol";

import "./interfaces/IERC20Token.sol";
import "./interfaces/IERC721SmartToken.sol";


/// SimpleExchange is RST <--> ETH echange based on ERC721 Smart token
contract SimpleExchange is Utils, Owned() {

    /// SimpleExchange Place Order event
    /// @param id NFT token ID for the order
    /// @param rate RST/ETH exchange rate
    /// @param value exchange value in ETH
    /// @param allowance exchange value in RST
    event Place(uint256 id, uint256 rate, uint256 value, uint256 allowance);

    /// SimpleExchange Cancel Order event
    /// @param id NFT token ID for the order
    /// @param owner NFT token owner
    event Cancel(uint256 id, address owner);

    /// SimpleExchange Buy event
    /// @param id NFT token ID for the order to purchase
    /// @param value RST value that was transfered to buyer
    /// @param amount ETH amount buyer has been paid (on contract account)
    event Buy(uint256 id, uint256 value, uint256 amount);

     /// SimpleExchange payment event
    /// @param id is NFT Order id
    /// @param amount ETH amount to receive
    /// @param owner NFT Order token owner
    event Payment(uint256 id, uint256 amount, address owner);

    /// SimpleExchange set amount event
    /// @param amount is new value
    /// @param old is old value
    event SetAmount(uint256 amount, uint256 old);

    /// SimpleExchange set rate event
    /// @param rate is new rate
    /// @param old is old rate
    event SetRate(uint256 rate, uint256 old);

    /// SimpleExchange set open event
    /// @param open is new open value
    /// @param old is old open value
    event SetOpen(bool open, bool old);
   

    /// RST token amount for order
    uint256 public amount;
    /// RST/ETH minimum rate
    uint256 public rate;
    /// SimpleExchange is open
    bool public open;
    /// RST smart contract address
    IERC20Token public RST;
    /// ERC721 Smart Token
    IERC721SmartToken public erc721;
    /// Order Status
    enum Status {Init, Closed, Active, Executed, Canceled}

    /// placeOrder
    /// @param _rate RST/ETH echange rate, must be >= rate
    function placeOrder(uint256 _rate) public {
        require(open, "Exchange is closed");
        require(_rate != uint256(0), "ERROR: RST/ETH rate is zero");
        require(_rate >= rate, "ERROR: RST/ETH rate is too low");
        require(RST != address(0),"ERROR: RST address is 0");  
        uint _allowance = RST.allowance(msg.sender, address(this));
        require(_allowance == amount, "ERROR: Allowance for RST token is not provided");
        uint256 _decimals = uint256(RST.decimals());
        uint _value = safeMul(_rate, amount);
        if (_decimals > uint8(0)) {                   // ... check if RST decimals is not 0
            _value = _value / (10 ** _decimals);      // ... and use decimals to convert RST to ETH
        }
        uint _id = erc721.createNFT(_value, "Order", uint(1), msg.sender);
        require(_id != uint256(0), "ERROR: NFT id is 0");
        erc721.setNFTState(_id, uint256(Status.Active));

        emit Place(_id, _rate, _value, _allowance);
    }

    function checkOrder() public view returns (uint256 check) {
        uint256 _rate = 50000000000000000;
        check = uint(0);
        uint _allowance = RST.allowance(msg.sender, address(this));
        uint256 _decimals = uint256(RST.decimals());
        
        if(open) check = check + 1;
        if(_rate != uint256(0)) check = check + 10;
        if(_rate >= rate) check = check + 100;
        if(RST != address(0)) check = check + 1000;
        if(_allowance == amount) check = check + 10000;
        if(amount > 0) check = check + 100000;
        uint _value = safeMul(_rate, amount);
        if (_decimals > uint8(0)) {                   // ... check if RST decimals is not 0
            _value = _value / (10 ** _decimals);      // ... and use decimals to convert RST to ETH
        }
        if(_decimals > 0) check = check + 1000000;
        if(_value > 0) check = check + 10000000;
    }

    /// cancelOrder 
    /// @param _id NFT token id for order to cancel
    function cancelOrder(uint256 _id) public {
        require(open, "Exchange is closed");
        require(_id != uint256(0),"ERROR: NFT token id is 0");
        require(erc721.owns(msg.sender, _id), "ERROR: Only token owner");

        erc721.setNFTState(_id, uint256(Status.Canceled));
        erc721.setNFTValue(_id,  uint(0));

        emit Cancel(_id, msg.sender);
    }

    /// find deal 
    function findDeal() public view returns(uint256 min, uint256 max, uint256 average, uint256 active, uint256 total, uint256 id) {
        uint256 count = erc721.totalSupply();

        id = 0;
        min = uint256(0);
        max = uint256(0);
        average = uint256(0);
        active = uint256(0);
        total = uint256(0);
        
        if( count == uint256(0) ) {
            return;
        }

        min = safeMul(rate, amount);

        for (uint256 _id = 1; _id <= count; _id++) {

            uint256 state = erc721.getNFTState(_id);
            uint256 value = erc721.getNFTValue(_id);

            if(state == uint256(Status.Active)) {
                active++;
                total = total + value;
                if(value < min) {
                    min = value;
                    id = _id;
                }
                if(value > max) {
                    max = value;
                }
            }
        }
        if(active != uint256(0)) {
            average = total / active; 
        } 
        else {
            min = uint256(0);
        }
    }

    /// buyOrder 
    /// @param _id NFT token id to buy from 
    function buyOrder(uint256 _id) public payable {
        require(open, "Exchange is closed");
        require(_id != uint256(0), "ERROR: NFT id is 0");
        require(erc721.getNFTState(_id) == uint256(Status.Active), "ERROR: Order is not active");
        require(RST != address(0),"ERROR: RST address is 0");
        address _owner = erc721.tokenIndexToOwner(_id);
        require(_owner != address(0), "ERROR: Order owner address is 0");
        uint _allowance = RST.allowance(_owner, address(this));
        require(_allowance == amount, "ERROR: Allowance for RST token is not provided");
        uint _value = erc721.getNFTValue(_id);
        require(_value != uint256(0), "ERROR: Order value is 0");
        require(_value == msg.value, "ERROR: Order value is not equal to message value");
        require(RST.transferFrom(_owner, msg.sender, amount),"ERROR: RST transfer");

        erc721.setNFTState(_id, uint256(Status.Executed));

        emit Buy(_id, _allowance, _value);
    }

    function buyOrderCheck(uint _id) public view returns (uint check) {
        check = 0;

        if(_id != uint256(0)) {
            check = check + 1;
        }
        if(erc721.getNFTState(_id) == uint256(Status.Active)) {
            check = check + 10;
        }
        if (RST != address(0)) {
            check = check + 100;
        }
        address _owner = erc721.tokenIndexToOwner(_id);
        if(_owner != address(0)) {
            check = check + 1000;
        }
        uint _allowance = RST.allowance(_owner, address(this));
        if(_allowance == amount) {
            check = check + 10000;
        }
        uint _value = erc721.getNFTValue(_id);
        if(_value != uint256(0)) {
            check = check + 100000;
        }

    }

    /// payment 
    /// @param _id NFT token to collect the payment from Executed order
    function payment(uint256 _id) public {
        require(open, "Exchange is closed");
        require(_id != uint256(0),"ERROR: NFT token id is 0");
        require(erc721.owns(msg.sender, _id), "ERROR: Only token owner");
        require(erc721.getNFTState(_id) == uint256(Status.Executed), "ERROR: Order is not in the Executed state");
        uint256 balance = address(this).balance;
        uint256 _value = erc721.getNFTValue(_id);
        require(balance >= _value, "ERROR: Exchange is short of funds to pay");
        msg.sender.transfer(_value);

        erc721.setNFTState(_id, uint256(Status.Closed));

        emit Payment(_id, _value, msg.sender);
    }
    function setAmount(uint256 _amount) public ownerOnly {
        require(_amount != uint256(0),"ERROR: amount is 0");
        uint _old = amount;
        amount = _amount;

        emit SetAmount(_amount, _old);
    }
    function setRate(uint256 _rate) public ownerOnly {
        require(_rate != uint256(0),"ERROR: rate is 0");
        uint _old = rate;
        rate = _rate;

        emit SetRate(_rate, _old);
    }
    function setOpen(bool _open) public ownerOnly {
        bool _old = open;
        open = _open;

        emit SetOpen(_open, _old);
    }
    /// token ID helpers
    function getCurrentToken() public view returns (uint256 id, uint256 value) {
        if(msg.sender == owner) {
            id = uint256(0);                         // return 0 for owner
            value = uint256(0);
        }
        else {
            uint256[] memory tokenIds = erc721.tokensOfOwner(msg.sender);
            id = tokenIds.length > 0 ? tokenIds[tokenIds.length-1] : uint256(0);
            value = uint256(0);
            if(id != uint256(0)) {
                if(erc721.getNFTState(id) == uint256(Status.Executed)) {
                    value = erc721.getNFTValue(id);
                }
            }
        }
    }
    function getToken(uint256 index) public view returns (uint256 id, uint256 value) {
        if(msg.sender == owner) {
            id = uint256(0);                         // return 0 for owner
            value = uint256(0);
        }
        else {
            uint256[] memory tokenIds = erc721.tokensOfOwner(msg.sender);
            id = tokenIds.length > 0 && index < tokenIds.length ? tokenIds[index] : uint256(0);
            value = uint256(0);
            if(id != uint256(0)) {
                if(erc721.getNFTState(id) == uint256(Status.Executed)) {
                    value = erc721.getNFTValue(id);
                }
            }
        }
    }
    function getBizProcessId() public view returns(address contractOwner, uint8 bizProcessId) {
        contractOwner = owner;
        bizProcessId = 0;

        // we don't need to set this connector to start using smart contract 
        // ... we nned to set up erc721.connectors to address(this)
        // ... but after this we meke abother transaction to set this.connectors[erc721] 
        // ... to signal that initialization is complited
        if (connectors[erc721] == address(0)) {
            bizProcessId = 100; 
            return;
        }
        
        uint256 id;
        uint256 value;
        (id, value) = getCurrentToken();
        if(id == uint256(0)) {
            uint allowance = RST.allowance(msg.sender, address(this));
            if(allowance == uint256(0)) {
                // the first step - need to make allowance
                bizProcessId = 1;
            }
            else {
                // need to make order
                bizProcessId = 2; 
            }
        }
        else {
            // we have current token id
            if (erc721.getNFTState(id) == uint(Status.Active)) {
                bizProcessId = 10;
            }
            else if (erc721.getNFTState(id) == uint(Status.Executed)) {
                bizProcessId = 11;
            }
            else if (erc721.getNFTState(id) == uint(Status.Closed)) {
                bizProcessId = 12;

            }
            else if (erc721.getNFTState(id) == uint(Status.Canceled)) {
                bizProcessId = 13;
            }
        }
    }
    constructor(address _rst, address _erc721) public { 
        amount = 7600000000;
        rate = 0.05 ether;
        RST = IERC20Token(_rst);
        erc721 = IERC721SmartToken(_erc721);
        open = true;
    }
}