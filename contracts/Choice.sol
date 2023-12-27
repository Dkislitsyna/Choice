pragma solidity ^0.4.11;

contract Choice {

    struct Offer{
        uint id;
        string name;
        uint voteCount;
    }

    mapping(address => bool) public voters;
    // Read/write offer
    mapping(uint => Offer) public offers;

    //
    uint public offersCount;

    event votedEvent (
        uint indexed _offerId
    );

    // Constructor
    function Choice () public {
        addOffer("Offer 1");
        addOffer("Offer 2");
        addOffer("Offer 3");
    }

    function addOffer(string _name) private{
        offersCount ++;
        offers[offersCount] = Offer(offersCount, _name, 0);
    }

    function vote(uint _off) public{
        require(!voters[msg.sender]);
        require(_off > 0 && _off <= offersCount);

        voters[msg.sender] = true;
        
        offers[_off].voteCount ++;

        votedEvent(_off);
    }
}