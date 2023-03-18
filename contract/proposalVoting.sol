// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

// Added NatSpec commment, you con read more about it [here](https://docs.soliditylang.org/en/v0.8.19/natspec-format.html#natspec)
// edited the readProposal function to display all the properties of the `Proposal` struct for increased efficiency
// Removed the getProposalLength function as it only returns the proposalLength. Made this variable public so it value can be assessed

/// @title A Voting Proposal system
/// @author Your name goes here
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

    //store all the voters
    mapping(address => bool) public voters;

    //modifier for onlyOwner
    modifier onlyOwner(uint _index){
        require(msg.sender == proposals[_index].owner,"You are not authorized");
        _;
    }

    /// @notice Add a new proposal
    /// @param _name The name of the proposal
    /// @param _description The description of the proposal
    function addProposal(string calldata _name, string calldata _description) public {
        // require(bytes(_name).length > 0, "name cannot be empty");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        proposals[proposalLength] = Proposal(
            payable(msg.sender), _name, _description, 0, 0, true
        );
        proposalLength++;
    }

    /// @notice Vote on created proposals
    /// @param _index The index of the proposal on the proposals mapping
    /// @param _vote Your vote on the proposal
    function vote(uint _index, bool _vote) public {
        require(proposals[_index].open == true, "Proposal is closed");
        require(voters[msg.sender] == false, "You have already voted");

        if(_vote == true) {
            proposals[_index].yesVotes++;
        } else {
            proposals[_index].noVotes++;
        }

        voters[msg.sender] = true;
    }
    
    /// @notice Get the details of a proposal stored in the proposals mapping
    /// @param _index The index of the proposal on the proposals mapping
    function readProposal(uint _index) public view returns(Proposal memory){
        return proposals[_index];
    }

    /// @notice Close a particular proposal
    /// @param _index The index of the proposal to be closed
    function closeProposal(uint _index) public onlyOwner(_index){ 
        require(proposals[_index].open == true, "Proposal is closed already");
        proposals[_index].open = false;
    } 

    /// @notice Delete a particular proposal
    /// @param _index The index of the proposal to be deleted
    function deleteProposal(uint _index) public onlyOwner(_index) {
        delete proposals[_index];
    }


}