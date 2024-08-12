import { useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
const ChatterJson = require("../../chatter-foundry/out/Chatter.sol/Chatter.json");
const chatterAddress = process.env.NEXT_PUBLIC_ADDRESS_SEPOLIA;

export default function SendMessage() {
  const [message, setMessage] = useState<string>("");
  const { writeContract } = useWriteContract();

  const handleSendMessage = async () => {
    writeContract({
      abi: ChatterJson.abi,
      address: chatterAddress as `0x${string}`,
      functionName: "setMessage",
      args: [message],
    });
    setMessage("");
  };

  return (
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
  );
}
