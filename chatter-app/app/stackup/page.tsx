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
const ChatterJson = require("../../../chatter-foundry/out/Chatter.sol/Chatter.json");
const chatterAddress = process.env.NEXT_PUBLIC_ADDRESS_SEPOLIA;

const rpcUrl = "https://public.stackup.sh/api/v1/node/ethereum-sepolia";
const paymasterUrl = ""; // Optional - you can get one at https://app.stackup.sh/

export default function Stackup() {
    const [connnectedAddress, setConnectAddress] = useState<`0x${string}` | undefined>();
    const { address } = useAccount();

    const signer = useEthersSigner();

    const [useSmartWallet, setUseSmartWallet] = useState<boolean>(false);

    const [builder, setBuilder] = useState<Presets.Builder.SimpleAccount>();

    useEffect(() => {
        console.log(useSmartWallet);
        if (useSmartWallet && signer) {
            setConnectAddress(undefined);
            const paymasterContext = { type: "payg" };
            const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
                paymasterUrl,
                paymasterContext
            );
            const opts = paymasterUrl === "" ? {} : {
                paymasterMiddleware: paymasterMiddleware,
            }
            Presets.Builder.SimpleAccount.init(signer, rpcUrl, opts).then(builder => {
                const smartWalletAddress = builder.getSender();
                console.log(`Account address: ${address} with smart contract address ${smartWalletAddress}`);
                setConnectAddress(smartWalletAddress as `0x${string}`);
                setBuilder(builder);
            });
        } else {
            setConnectAddress(address);
        }
    }, [useSmartWallet]);

    const [message, setMessage] = useState<string>("");
    const { writeContract } = useWriteContract();

    const handleSendMessage = async () => {
        try {
            if (useSmartWallet && connnectedAddress) {
                if(builder) {
                    const value = "0"; // Amount of the ERC-20 token to transfer

                    // Encode the calls
                    const callTo = [chatterAddress as string];
                    const data = encodeFunctionData({
                        abi: ChatterJson.abi,
                        functionName: 'setMessage',
                        args: [message]
                    })
                    const callData = [data]
    
                    Client.init(rpcUrl).then(async client => {
                        const res = await client.sendUserOperation(builder.executeBatch(callTo, callData), {
                            onBuild: (op) => console.log("Signed UserOperation:", op),
                        });
        
                        // Return receipt
                        console.log(`UserOpHash: ${res.userOpHash}`);
                        console.log("Waiting for transaction...");
                        const ev = await res.wait();
                        console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
                        console.log(`View here: https://jiffyscan.xyz/userOpHash/${res.userOpHash}`);
                    });
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
            console.error("Erro ao enviar mensagem ou executar transação ERC-20:", e);
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
                    <div className="flex jutify-between item-center">Account: {connnectedAddress}</div>
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
