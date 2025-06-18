import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';

const Bridge = () => {
  const [amount, setAmount] = useState('0.00');
  const [fromChain, setFromChain] = useState('Ethereum');
  const [toChain, setToChain] = useState('Yafa L2');
  const { address, isConnected } = useAccount();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061E18] to-[#1C3F36] font-vt323 text-green-400">
      {/* Grid overlay pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <img src="/yafa-logo.png" alt="Yafa" className="h-12" />
          <button className="px-6 py-2 border-2 border-green-400 rounded 
                           hover:bg-green-400/20 transition-all duration-300
                           text-green-400 font-vt323 text-xl">
            {isConnected ? 'Connected: ' + address.slice(0,6) + '...' : 'Connect Wallet'}
          </button>
        </div>

        <div className="max-w-lg mx-auto bg-[#0A2822] p-6 rounded-lg 
                      border-2 border-green-400/30 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
          {/* Bridge Form */}
          <div className="space-y-6">
            <div className="bridge-input-group">
              <label className="block mb-2">Bridge from:</label>
              <select 
                className="w-full bg-[#061E18] border-2 border-green-400/30 
                         rounded px-4 py-2 text-green-400 focus:border-green-400
                         focus:outline-none"
                value={fromChain}
                onChange={(e) => setFromChain(e.target.value)}
              >
                <option>Ethereum</option>
              </select>
            </div>

            <div className="bridge-input-group">
              <label className="block mb-2">Bridge to:</label>
              <select 
                className="w-full bg-[#061E18] border-2 border-green-400/30 
                         rounded px-4 py-2 text-green-400 focus:border-green-400
                         focus:outline-none"
                value={toChain}
                onChange={(e) => setToChain(e.target.value)}
              >
                <option>Yafa L2</option>
              </select>
            </div>

            <div className="bridge-input-group">
              <label className="block mb-2">Amount:</label>
              <input
                type="text"
                className="w-full bg-[#061E18] border-2 border-green-400/30 
                         rounded px-4 py-2 text-green-400 focus:border-green-400
                         focus:outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00 ETH"
              />
            </div>

            <button 
              className="w-full bg-green-400 text-[#061E18] py-3 rounded
                       font-bold text-xl hover:bg-green-500 transition-all
                       duration-300 shadow-[0_0_15px_rgba(74,222,128,0.5)]"
            >
              💸 Bridge Now
            </button>

            <div className="flex justify-between text-sm text-green-400/70">
              <span>Status: ✔ Connected</span>
              <span>Gas Est: ~0.004 ETH</span>
            </div>

            <div className="flex justify-between gap-4 mt-6">
              <button className="flex-1 px-4 py-2 border border-green-400/30 
                               rounded hover:bg-green-400/20 transition-all">
                📖 View Bridge History
              </button>
              <button className="flex-1 px-4 py-2 border border-green-400/30 
                               rounded hover:bg-green-400/20 transition-all">
                🔗 Explorer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bridge;