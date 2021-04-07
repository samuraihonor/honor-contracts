const Web3 = require('web3');
const fs = require('fs');
const pk = '2f993fb743f2285731efc4ed375536080933f31198c24ed28a7a224aa7febcbc';
const endpoint = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

const factoryAddress = '0x6725F303b657a9451d8BA641348b6761A6CC7a17';

const web3 = new Web3(endpoint);

const run = async () => {
  // add pk and retrieve address
  const address = (web3.eth.accounts.wallet.add(pk)).address;
  console.log(`fromAddress: ${address}`);
  const latestBlock = (await web3.eth.getBlock('latest')).number;
  console.log(`latest block number: ${latestBlock}`);

  const PancakeFactory = getContract('PancakeFactory');
  const BEP20 = getContract('BEP20');
  const MasterChefV2 = getContract('MasterChefV2');
  const factoryAbi = PancakeFactory.abi;
  const bep20Abi = BEP20.abi;
  const bep20Bin = BEP20.bytecode;
  const masterChefAbi = MasterChefV2.abi;
  const masterChefBin = MasterChefV2.bytecode;
  const pancakeFactoryContract = new web3.eth.Contract(factoryAbi, factoryAddress);
  const bep20Contract = new web3.eth.Contract(bep20Abi);
  const masterChefContract = new web3.eth.Contract(masterChefAbi);
  const busdToken = await bep20Contract.deploy({
    data: bep20Bin,
    arguments: ['BUSD', 'BUSD']
  })
  .send({
    from: address,
    gas: 2000000
  });
  const honorToken = await bep20Contract.deploy({
    data: bep20Bin,
    arguments: ['HONOR', 'HONOR']
  })
  .send({
    from: address,
    gas: 2000000
  });
  const busdTokenAddress = busdToken.options.address;
  const honorTokenAddress = honorToken.options.address;
  const masterChef = await masterChefContract.deploy({
    data: masterChefBin,
    arguments: [honorTokenAddress, address, '1000000000000000000', latestBlock]
  })
  .send({
    from: address,
    gas: 3000000
  });
  const tx = await pancakeFactoryContract.methods.createPair(busdTokenAddress, honorTokenAddress).send({
    from: address,
    gas: '2000000'
  });
  const tokenPoolAddress = tx.events.PairCreated.returnValues.pair;
  console.log(`master chef: ${masterChef.options.address}`);
  console.log(`busdToken: ${busdTokenAddress}\ntoken2: ${honorTokenAddress}\ntoken pool: ${tokenPoolAddress}`)
}

const getContract = (contractName) => {
  if (!fs.existsSync(`./build/contracts/${contractName}.json`)) throw new Error(`Missing ${contractName}`);
  const contract = require(`../build/contracts/${contractName}.json`);
  return contract;
}

run().catch(console.log);
