"use client";

import { Plus } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";


export default function AddTask() {

    const router = useRouter();
  
  return (
    <Button className="shadow-blue-700 shadow-2xl" size="lg" variant="primary" isIconOnly onClick={() => router.push("/add")} onMouseEnter={() => router.prefetch("/add")}><Plus className="size-6" /></Button>
  );
}