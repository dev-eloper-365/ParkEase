import React from "react";
import { Meteors } from "@/components/ui/meteors";
import { Car } from "lucide-react";

interface NewCarNotificationProps {
  plate: string;
  timeIn: string;
  blockId: string;
  onClose: () => void;
}

export function NewCarNotification({ plate, timeIn, blockId, onClose }: NewCarNotificationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred background overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-500 ease-in-out"
        onClick={onClose}
      />
      
      {/* Notification card */}
      <div className="relative w-full max-w-2xl transform transition-all duration-300 ease-out animate-in zoom-in-95 fade-in">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] bg-red-500 rounded-full blur-3xl opacity-30" />
        
        <div className="relative shadow-xl bg-black border-2 border-gray-800 px-8 py-16 h-full overflow-hidden rounded-3xl flex flex-col items-start">
          {/* Car Image */}
          <div className="w-full mb-8 relative z-50">
            <img 
              src="/car.png" 
              alt="Car" 
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>

          <div className="h-10 w-10 rounded-full border-2 flex items-center justify-center mb-8 border-gray-500 relative z-50">
            <Car
              className="h-6 w-6 text-gray-300"
            />
          </div>

          <h1 className="font-bold text-4xl text-white mb-8 relative z-50">
            New Car Added!
          </h1>
          
          <div className="space-y-4 mb-8 relative z-50">
            <p className="font-normal text-base text-slate-400">
              License Plate
            </p>
            <p className="font-mono font-bold text-3xl text-white">
              {plate}
            </p>
            <p className="font-normal text-base text-slate-400">
              Time In: <span className="text-white">{timeIn}</span>
            </p>
            <p className="font-normal text-base text-slate-400">
              Block ID: <span className="font-mono text-sm text-white">{blockId}</span>
            </p>
          </div>

          <button 
            onClick={onClose}
            className="border-2 px-8 py-2 rounded-2xl border-gray-500 text-gray-300 hover:bg-gray-800 transition-colors relative z-50 text-base"
          >
            Close
          </button>

          {/* Meteor effect */}
          <Meteors number={20} />
        </div>
      </div>
    </div>
  );
}

