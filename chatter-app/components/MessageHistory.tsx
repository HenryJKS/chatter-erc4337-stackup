"use client";
import { useEffect, useState } from "react";
import { Log } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import ChatMessage from "./ChatMessage";

const ChatterJson = require("../../chatter-foundry/out/Chatter.sol/Chatter.json");
const chatterAddress = process.env.NEXT_PUBLIC_ADDRESS;

export default function MessageHistory() {
  const [messages, setMessages] = useState<Log[]>([]);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await publicClient?.getContractEvents({
        address: chatterAddress as `0x${string}`,
        abi: ChatterJson.abi,
        eventName: "Message",
        fromBlock: BigInt(0),
        toBlock: "latest",
      });
      setMessages((oldMessages) => [...oldMessages, ...(events || [])]);
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
          />
        </div>
      ))}
    </div>
  );
}
