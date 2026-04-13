"use client";

import { usePathname, useRouter } from "next/navigation";
import { House, ChartAreaStacked, Gear, Plus } from "@gravity-ui/icons";
import { Button } from "@heroui/react";

const items = [
  { label: "Главная", icon: House, path: "/" },
  { label: "Статистика", icon: ChartAreaStacked, path: "/stats" },
  { label: "Параметры", icon: Gear, path: "/settings" },
];

export default function Menu() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 z-50 flex justify-center w-full bg-white/20 backdrop-blur-lg border-t border-gray-200/50 py-2">
      <div className="flex items-center gap-2">
        
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`relative flex flex-col items-center justify-center px-4 py-2 rounded-xl transition
                ${active ? "text-accent" : "text-black/60 hover:text-black"}`}
            >
              {active && (
                <span className="absolute inset-0" />
              )}

              <Icon className="relative z-10 size-5" />
              <span className="text-[12px] relative z-10">{item.label}</span>
            </button>
          );
        })}

        <div id="addTask" className="">
            <Button isIconOnly variant="primary"><Plus /></Button>
        </div>

      </div>
    </div>
  );
}