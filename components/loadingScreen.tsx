// components/LoadingScreen.tsx
import { Spinner } from "@heroui/react";

export default function LoadingScreen() {
    return (
        <div className="flex justify-center items-center h-screen w-full">
            <Spinner size="lg" />
        </div>
    );
}