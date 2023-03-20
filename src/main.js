import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import proposalVotingAbi from "../contract/proposalVoting.abi.json"


const ERC20_DECIMALS = 18
const ContractAddress = "0x43d3BfF4189C8B0FeB97EDc2F073bBc095f0AF19"

let kit
let contract
let proposals = [];

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(proposalVotingAbi, ContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}


const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

// 2
const getProposals = async function() {
  const _proposalLength = await contract.methods.getLengthOfProposals().call()
  const _proposalArr = []
  for (let i = 0; i < _proposalLength; i++) {
    let _proposal = new Promise(async (resolve, reject) => {
      let p = await contract.methods.readProposal(i).call()
      resolve({
        index: i,
        owner: p[0],
        name: p[1],
        description: p[2],
        yesVotes: p[3],
        noVotes: p[4],
        open: p[5],
      })
    })
    _proposalArr.push(_proposal)
  }
  proposals = await Promise.all(_proposalArr)
  renderProposals()
}

function renderProposals() {

  let proposalsDiv = $("#proposalsDiv");
  proposalsDiv.empty();

  if (proposals) {
    for (let i = 0; i < proposals.length; i++) {
      if (proposals[i]["name"].length) {
        proposalsDiv.append(
          `
          <div class="col-md-4">
            <div class="card mb-4">
              <div class="card-body text-left p-3 position-relative">
                <div class="translate-middle-y position-absolute top-0 end-0"  id="${proposals[i].index}">
                ${identiconTemplate(proposals[i].owner)}
                </div>
                <p class="card-title  fw-bold mt-2 text-uppercase">${proposals[i].name}</p>
                <p class="mt-2 text-left fs-6">
                  ${proposals[i].description}
                </p>
                <div class="d-grid gap-2">   
                  <p>YesVotes: ${proposals[i].yesVotes}</p>
                  <p>NoVotes: ${proposals[i].noVotes}</p>
                </div>

                <div class="row">
                  <div class="col-sm"><p>Vote:</p></div>
                  <div class="col-sm">
                    <a class="btn btn-success yesVote" id=${proposals[i].index}>YES</a>
                  </div>
                  <div class="col-sm">
                  <a class="btn btn-success noVote" id=${proposals[i].index}>NO</a>
                  </div>
                </div>
                <br/>
                <div class="d-grid gap-2">   
                  <a class="btn btn-success closeBtn fs-6 p-3" id=${proposals[i].index}>Close Proposal
                  </a>
                  <a class="btn btn-success deleteBtn" id=${proposals[i].index}>Delete Proposal
                  </a>
                  
                </div>
                
              </div>
            </div>
          </div>

          `
        )
      }
    }
  }

}

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

// 3
window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProposals()
  notificationOff()
});
// 1
document
  .querySelector("#addProposal")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("proposalName").value,
      document.getElementById("proposalDescription").value,
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
      await contract.methods
        .addProposal(...params)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully added "${params[0]}".`)
      getProposals()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notificationOff()
  })

// implements the vote yes functionaly
document.querySelector("#proposalsDiv").addEventListener("click", async (e) => {
  if (e.target.className.includes("yesVote")) {
    const index = e.target.id
    notification("⌛ Voting YES...")
    try {
      await contract.methods
        .vote(index, true)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully voted YES for "${proposals[index].name}".`)
      getProposals()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notificationOff()
  }
})  

// implements the vote no functionaly
document.querySelector("#proposalsDiv").addEventListener("click", async (e) => {
  if (e.target.className.includes("noVote")) {
    const index = e.target.id
    notification("⌛ Voting NO...")
    try {
      await contract.methods
        .vote(index, false)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully voted no for "${proposals[index].name}".`)
      getProposals()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notificationOff()
  }
})  
// implements the delete functionality
document.querySelector("#proposalsDiv").addEventListener("click", async (e) => {
  if (e.target.className.includes("deleteBtn")) {

    // declaring variables for the smartcontract parameters
    const index = e.target.id
    console.log(index);

    notification(`⌛ Deleting "${proposals[index].name}"...`)
    try {
      // const result = 
      await contract.methods
        .deleteProposal(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully deleted "${proposals[index].name}".`)
      getProposals()

    } catch (error) {
      notification(`⚠️ ${error}.`)
    }

    notificationOff()
 
  }
})

document.querySelector("#proposalsDiv").addEventListener("click", async (e) => {
  if (e.target.className.includes("closeBtn")) {

    // declaring variables for the smartcontract parameters
    const index = e.target.id
    console.log(index);

    notification(`⌛ Closing "${proposals[index].name}"...`)
    try {

      await contract.methods
        .closeProposal(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully closed "${proposals[index].name}".`)
      getProposals()

    } catch (error) {
      notification(`⚠️ ${error}.`)
    }

    notificationOff()

  }
})

