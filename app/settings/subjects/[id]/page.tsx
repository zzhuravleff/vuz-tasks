// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { useAppData } from "@/hooks/useAppData";
// import { Button, IconChevronLeft } from "@heroui/react";

// export default function DisciplinePage() {
//   const { id } = useParams();
//   const router = useRouter();
//   const { data, update } = useAppData();

//   if (!data) return null;

//   const subject = data.subjects.find((s) => s.id === id);
//   if (!subject) return <div>Discipline not found</div>;

//   return (
//     <div className="flex flex-col gap-4 w-full">
//         <Button variant="tertiary" onPress={() => router.back()}>
//             <IconChevronLeft className="size-4" />
//             Назад
//         </Button>

//         <h1 className="text-2xl font-medium text-center">
//             {subject.name}
//         </h1>

//         {/* список */}

//     </div>
//   );
// }