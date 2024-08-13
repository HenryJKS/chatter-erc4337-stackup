"use client";
import MessageHistory from "@/components/MessageHistory";
import ScrollableBox from "@/components/ScrollableBox";
import SendMessage from "@/components/SendMessage";
import { useEthersSigner } from "@/lib/ether";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { Presets, Client } from "userop";
import { encodeFunctionData } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { getChainId } from '@wagmi/core'
import { config } from "@/src/wagmi";
import { SafeAccountV0_2_0 as SafeAccount, calculateUserOperationMaxGasCost, MetaTransaction } from "abstractionkit";
const ChatterJson = require("../../../chatter-foundry/out/Chatter.sol/Chatter.json");
const chatterAddress = process.env.NEXT_PUBLIC_ADDRESS_SEPOLIA;

const rpcUrlNode = process.env.NEXT_PUBLIC_PAYMASTER_NODE as string;
const bundlerUrl = process.env.NEXT_PUBLIC_BUNLDER_URL as string; // Optional - you can get one at https://app.stackup.sh/
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY as string;

export default function Candide() {
    const [connnectedAddress, setConnectAddress] = useState<`0x${string}` | undefined>();
    const { address } = useAccount();

    const signer = useEthersSigner();

    const [useSmartWallet, setUseSmartWallet] = useState<boolean>(false);

    const chainId = getChainId(config);

    useEffect(() => {
        console.log(useSmartWallet);
        if (useSmartWallet && signer) {
            setConnectAddress(undefined);
            const smartAccount = SafeAccount.initializeNewAccount([address as `0x${string}`]);

            setConnectAddress(smartAccount.accountAddress as `0x${string}`);

            console.log("the chain id is: " + chainId)
        } else {
            setConnectAddress(address);

            console.log("the chain id is: " + chainId)
        }
    }, [useSmartWallet]);

    const [message, setMessage] = useState<string>("");
    const { writeContract } = useWriteContract();

    const handleSendMessage = async () => {
        try {
            if (useSmartWallet && connnectedAddress) {

                let smartAccount = SafeAccount.initializeNewAccount(
                    [address as string],
                )

                const data = encodeFunctionData({
                    abi: ChatterJson.abi,
                    functionName: "setMessage",
                    args: [message],
                });

                const callData = SafeAccount.createAccountCallDataSingleTransaction({
                    to: chatterAddress as `0x${string}`,
                    value: BigInt(0),
                    data: data
                });

                const transaction1: MetaTransaction = {
                    to: chatterAddress as `0x${string}`,
                    value: BigInt(0),
                    data: data
                }

                console.log("callData: " + callData);

                let userOperation = await smartAccount.createUserOperation(
                    [transaction1], // you can batch multiple transactions to be executed in one userop
                    rpcUrlNode, // the node rpc is used to fetch the current nonce and fetch gas prices.
                    bundlerUrl, // the bundler rpc is used to estimate the gas limits
                    // {
                    //     verificationGasLimit: BigInt(500000)
                    // }
                )

                const cost = calculateUserOperationMaxGasCost(userOperation)

                console.log("This useroperation may cost upto : " + cost + " wei")
                console.log("Please fund the sender account : " + userOperation.sender + " with more than " + cost + " wei")

                userOperation.signature = smartAccount.signUserOperation(
                    userOperation,
                    [privateKey],
                    BigInt(chainId)
                )
                console.log(userOperation)

                const sendUserOperationResponse = await smartAccount.sendUserOperation(
                    userOperation, bundlerUrl
                )

                console.log("Useroperation sent. Waiting to be included ......")

                let userOperationReceiptResult = await sendUserOperationResponse.included()

                console.log("Useroperation receipt received.")
                console.log(userOperationReceiptResult)
                if (userOperationReceiptResult.success) {
                    console.log("The transaction hash is : " + userOperationReceiptResult.receipt.transactionHash)
                } else {
                    console.log("Useroperation execution failed")
                }

            } else {
                writeContract({
                    abi: ChatterJson.abi,
                    address: chatterAddress as `0x${string}`,
                    functionName: "setMessage",
                    args: [message],
                });
                setMessage("");
            }
        } catch (e) {
            console.error("Erro ao enviar mensagem ou executar transação:", e);
        }
    };

    return (
        <main className="container max-w-xl mx-auto">
            <div className="flex flex-col h-screen justify-between gap-5">
                <div className="flex flex-col gap-5 py-5">
                    <div className="flex justify-between items-center">
                        <ConnectButton />
                        <div>
                            <label className="inline-flex items-center mb-5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useSmartWallet}
                                    className="sr-only peer"
                                    onChange={() => {
                                        setUseSmartWallet(!useSmartWallet);
                                    }}
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Smart Wallet
                                </span>
                            </label>
                        </div>
                    </div>
                    <div className="flex jutify-between item-center">
                        Account: {connnectedAddress}
                    </div>
                    <ScrollableBox classname="flex flex-col py-5 w-full h-full overflow-y-auto">
                        <MessageHistory address={connnectedAddress} />
                    </ScrollableBox>
                    <div className="flex w-full p-5 border-t-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(event) => {
                                if (event.key == "Enter" && (event.metaKey || event.ctrlKey)) {
                                    SendMessage();
                                }
                            }}
                            placeholder="message..."
                            className="w-full text-gray-600 p-3 bg-gray-200 rounded-md focus:outline-none focus:placeholder-gray-300"
                        />
                        <button
                            type="button"
                            className="px-4 py-3 bg-blue-500 rounded-r-lg hover:bg-blue-300 ease-in-out duration-500"
                            onClick={handleSendMessage}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
