// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;


contract ProposalVoting {

    //stores the number of added provisions
    uint internal proposalLength;

    //cUSD token address
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    //struct for proposal voting 
    struct Proposal {
        address payable owner;
        string name;
        string description;
        uint yesVotes;
        uint noVotes;
        bool open;
    }

    //store all the added provisions
    mapping(uint => Proposal) internal proposals;

    //modifier for onlyOwner
    modifier onlyOwner(uint _index){
        require(msg.sender == proposals[_index].owner,"You are not authorized");
        _;
    }

    // 1. Get the length of added provisions
    function getLengthOfProposals() public view returns(uint) {
        return proposalLength;
    }

    // 2. Add a new proposal
    function addProposal(string calldata _name, string calldata _description) public {
        // require(bytes(_name).length > 0, "name cannot be empty");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        proposals[proposalLength] = Proposal(
            payable(msg.sender), _name, _description, 0, 0, true
        );
        proposalLength++;
    }

    // 3. Vote on a proposal
    function vote(uint _index, bool _vote) public {
        require(proposals[_index].open == true, "Proposal is closed");

        if(_vote == true) {
            proposals[_index].yesVotes++;
        } else {
            proposals[_index].noVotes++;
        }

    }
        //get a camera with specific id
    function readProposal(uint _index) public view returns(
        address payable,
        string memory,
        string memory,
        uint,
        uint,
        bool
    ){
        return 
        (
            proposals[_index].owner,
            proposals[_index].name,
            proposals[_index].description,
            proposals[_index].yesVotes,
            proposals[_index].noVotes,
            proposals[_index].open

        );
    }

    // // 4. Close proposal
    function closeProposal(uint _index) public onlyOwner(_index){ 
        require(proposals[_index].open == true, "Proposal is closed already");
        proposals[_index].open = false;
    } 

    // 5. Delete proposal
    function deleteProposal(uint _index) public onlyOwner(_index) {
        delete proposals[_index];
    }


}
