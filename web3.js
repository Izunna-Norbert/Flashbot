require('dotenv').config()
const ethers = require('ethers');
const { FlashbotsBundleProvider } = require('@flashbots/ethers-provider-bundle')

const abi = require('./abi.json')

const API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const alchemyProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);
// Signer
const signer = new ethers.Wallet(PRIVATE_KEY);

// Contract
// const smallBrosContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

const connectionUri = "https://relay-goerli.flashbots.net";

const GWEI = ethers.BigNumber.from([10]).pow("9");
const BLOCKS_IN_THE_FUTURE = 2


    async function mintNFT() {
        try {
            console.info(GWEI);
            const flashBotProvider = await FlashbotsBundleProvider.create(alchemyProvider, signer, connectionUri)
            alchemyProvider.on("block", async (blockNumber) => {
                console.log(blockNumber);
                const block = await alchemyProvider.getBlock(blockNumber)
                
                const maxBaseFeeInFutureBlock = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(block.baseFeePerGas, BLOCKS_IN_THE_FUTURE)
                const res = await flashBotProvider.sendBundle([
                    {
                        transaction: {
                            chainId: 5,
                            type: 2,
                            value: ethers.BigNumber.from(0),
                            gasLimit: 50000,
                            data: "0x",
                            maxFeePerGas: GWEI.mul("3"),
                            maxPriorityFeePerGas: GWEI.mul("2"),
                            to: "0x957B500673A4919C9394349E6bbD1A66Dc7E5939"
                        },
                        signer: signer,
                    }
                ], blockNumber + 1)
                console.log(res)
            })
        } catch (error) {
            console.error(error);
            return error;
        }
    }

mintNFT()

