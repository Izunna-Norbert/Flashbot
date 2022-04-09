require('dotenv').config();
const { BigNumber, providers, Wallet, ethers } = require('ethers');
const { FlashbotsBundleProvider, FlashbotsBundleResolution } = require('@flashbots/ethers-provider-bundle');
const { TransactionRequest } = require('@ethersproject/abstract-provider');

const FLASHBOTS_AUTH_KEY = process.env.FLASHBOTS_AUTH_KEY;

const GWEI = BigNumber.from(10).pow(9);
const PRIORITY_FEE = GWEI.mul(3);
const LEGACY_GAS_PRICE = GWEI.mul(12);
const ETHER = BigNumber.from(10).pow(18);

const BLOCKS_IN_THE_FUTURE = 2;

const CHAIN_ID = 1
const provider = new providers.AlchemyProvider(CHAIN_ID, process.env.ALCHEMY_API_KEY)
const FLASHBOTS_EP = 'https://relay-goerli.flashbots.net/'
// ===== Uncomment this for Goerli =======

async function FlashbotMint() {
  const authSigner = FLASHBOTS_AUTH_KEY ? new Wallet(FLASHBOTS_AUTH_KEY) : Wallet.createRandom()
  const wallet = new Wallet(process.env.PRIVATE_KEY || '', provider)
  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, authSigner);

  const legacyTransaction = {
    to: "0x957B500673A4919C9394349E6bbD1A66Dc7E5939",
    gasPrice: LEGACY_GAS_PRICE,
    gasLimit: 50000,
    data: '0xa0712d680000000000000000000000000000000000000000000000000000000000000001',
    nonce: await provider.getTransactionCount(wallet.address)
  }

  provider.on('block', async (blockNumber) => {
    console.log(blockNumber);
    const block = await provider.getBlock(blockNumber)

    let eip1559Transaction;
    if (block.baseFeePerGas == null) {
      console.warn('This chain is not EIP-1559 enabled, defaulting to two legacy transactions for demo')
      eip1559Transaction = { ...legacyTransaction }
      // We set a nonce in legacyTransaction above to limit validity to a single landed bundle. Delete that nonce for tx#2, and allow bundle provider to calculate it
      delete eip1559Transaction.nonce
    } else {
      const maxBaseFeeInFutureBlock = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(block.baseFeePerGas, BLOCKS_IN_THE_FUTURE)
      console.log('maxFee', ethers.utils.formatEther(maxBaseFeeInFutureBlock));
      eip1559Transaction = {
        value: ETHER.div(100).mul(6),
        to: "0x20EE855E43A7af19E407E39E5110c2C1Ee41F64D",
        type: 2,
        maxFeePerGas: PRIORITY_FEE.add(maxBaseFeeInFutureBlock),
        maxPriorityFeePerGas: PRIORITY_FEE,
        // gasLimit: 50000,
        data: '0xf218c01c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000123d67d503c7c3b7c6d70abc12fc1ef10b7eb7dff0eeddb16c65e441cb3d5e214',
        chainId: CHAIN_ID
      }
    }

    const signedTransactions = await flashbotsProvider.signBundle([
    //   {
    //     signer: wallet,
    //     transaction: legacyTransaction
    //   },
      {
        signer: wallet,
        transaction: eip1559Transaction
      }
    ])
    const targetBlock = blockNumber + BLOCKS_IN_THE_FUTURE
    const simulation = await flashbotsProvider.simulate(signedTransactions, targetBlock)
    // Using TypeScript discrimination
    if ('error' in simulation) {
      console.warn(`Simulation Error: ${ethers.utils.formatEther('103464789094750000')} ${simulation.error.message}`)
      process.exit(1)
    } else {
      console.log(`Simulation Success: ${JSON.stringify(simulation, null, 2)}`)
    }
    const bundleSubmission = await flashbotsProvider.sendRawBundle(signedTransactions, targetBlock)
    console.log('bundle submitted, waiting')
    if ('error' in bundleSubmission) {
      throw new Error(bundleSubmission.error.message)
    }
    const waitResponse = await bundleSubmission.wait()
    console.log(`Wait Response: ${FlashbotsBundleResolution[waitResponse]}`)
    if (waitResponse === FlashbotsBundleResolution.BundleIncluded || waitResponse === FlashbotsBundleResolution.AccountNonceTooHigh) {
      process.exit(0)
    } else {
      console.log({
        bundleStats: await flashbotsProvider.getBundleStats(simulation.bundleHash, targetBlock),
        userStats: await flashbotsProvider.getUserStats()
      })
    }
  })
}

FlashbotMint()