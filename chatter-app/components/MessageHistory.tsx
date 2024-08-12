"use client";
import { useEffect, useState } from "react";
import { Log } from "viem";
import { useBlockNumber, usePublicClient, useWatchContractEvent } from "wagmi";
import ChatMessage from "./ChatMessage";

const ChatterJson = require("../../chatter-foundry/out/Chatter.sol/Chatter.json");
const chatterAddress = process.env.NEXT_PUBLIC_ADDRESS_SEPOLIA;

export default function MessageHistory({
  address,
}: {
  address: `0x${string}` | undefined;
}) {
  const [messages, setMessages] = useState<Log[]>([]);
  const publicClient = usePublicClient();
  const { data: blocknumber } = useBlockNumber();

  useEffect(() => {
    const fetchEvents = async () => {
      if (blocknumber) {
        const events = await publicClient?.getContractEvents({
          address: chatterAddress as `0x${string}`,
          abi: ChatterJson.abi,
          eventName: "Message",
          fromBlock: blocknumber - BigInt(100),
          toBlock: "latest",
        });
        setMessages((oldMessages) => [...oldMessages, ...(events || [])]);
      }
    };

    fetchEvents();
  }, [publicClient]);

  useWatchContractEvent({
    address: chatterAddress as `0x${string}`,
    abi: ChatterJson.abi,
    eventName: "Message",
    onLogs(logs) {
      setMessages((oldMessages) => {
        return oldMessages ? [...oldMessages, ...logs] : logs;
      });
    },
  });

  return (
    <div className="flex flex-col gap-2 w-full">
      {messages.map((logmsg, i) => (
        <div key={i}>
          <ChatMessage
            address={logmsg.args.sender}
            message={logmsg.args.message}
            connectedAddress={address}
          />
        </div>
      ))}
    </div>
  );
}
