"use client";
import { Plus } from "@gravity-ui/icons";
import { Button } from "@heroui/react";


export default function AddTask() {
  
  return (
    <Button className="fixed z-50 bottom-20 right-4 shadow-blue-700 shadow-2xl" size="lg" variant="primary" isIconOnly onClick={() => {}}><Plus className="size-5" /></Button>
  );
}