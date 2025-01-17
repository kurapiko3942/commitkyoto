// components/BusLegend.tsx
import { useState } from 'react';

const BusLegend = () => {
  const [isOpen, setIsOpen] = useState(false);

  const legendItems = [
    { icon: "/bus-icon-1.svg", label: "ほとんど空いています" },
    { icon: "/bus-icon-2.svg", label: "座席に余裕があります" },
    { icon: "/bus-icon-3.svg", label: "座席が少し残っています" },
    { icon: "/bus-icon-4.svg", label: "立ち乗りのみ可能です" },
    { icon: "/bus-icon-5.svg", label: "混雑しています" },
    { icon: "/bus-icon-6.svg", label: "非常に混雑しています" },
    { icon: "/bus-icon-7.svg", label: "乗車できない可能性があります" },
  ];

  return (
    <div className="absolute left-4 bottom-4 z-[1000]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 
                   transition-all duration-200 flex items-center gap-2"
      >
        <img src="/bus-icon.svg" alt="バスアイコン" className="w-6 h-6" />
        <span>混雑度早見表</span>
        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 bg-white rounded-lg shadow-lg p-4 animate-fade-in">
          <h3 className="font-bold mb-3 text-gray-700">バスの混雑状況</h3>
          <div className="grid gap-3">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <img 
                  src={item.icon} 
                  alt={item.label}
                  className="w-8 h-8"
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusLegend;