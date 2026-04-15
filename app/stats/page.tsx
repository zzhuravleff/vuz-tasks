"use client";

import { useStore } from "@/hooks/useStore";
import { Chip } from "@heroui/react";

export default function StatsPage() {
  const { data, store } = useStore();

  if (!data) return null;

  const completedTasks = data.tasks.filter(
    (t) => t.status === "completed"
  );

  const overdueTasks = data.tasks.filter((t) => {
    if (t.status === "completed") return false;
    return new Date(t.deadline) < new Date();
  });

  const statsTasks = data.tasks.filter(
    (t) => (t.status == "completed") || (new Date(t.deadline) < new Date())
  );

  const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const months = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    };

  return (
    // <div className="flex flex-col gap-6 w-full p-4">

    //     {completedTasks.length === 0 ? (
    //       <div className="text-gray-400">
    //         Нет выполненных задач
    //       </div>
    //     ) : (
    //       completedTasks.map((task) => (
    //         <div
    //           key={task.id}
    //           className="p-3 border rounded cursor-pointer hover:bg-gray-100"
    //           onClick={() => store.deleteTask(task.id)}
    //         >
    //           {task.type === "Расписание"
    //             ? `Задача по расписанию`
    //             : task.title}
    //         </div>
    //       ))
    //     )}
    //   </div>

    //   {/* OVERDUE */}
    //   <div className="flex flex-col gap-2">
    //     <h2 className="text-lg font-medium">
    //       Просроченные задачи
    //     </h2>

    //     {overdueTasks.length === 0 ? (
    //       <div className="text-gray-400">
    //         Нет просроченных задач
    //       </div>
    //     ) : (
    //       overdueTasks.map((task) => (
    //         <div
    //           key={task.id}
    //           className="p-3 border rounded cursor-pointer hover:bg-red-50"
    //           onClick={() => store.deleteTask(task.id)}
    //         >
    //           {task.type === "Расписание"
    //             ? `Просроченная задача`
    //             : task.title}
    //         </div>
    //       ))
    //     )}
    //   </div>

    // </div>

    <div className="flex flex-col gap-4">
        <div className="w-full flex gap-2">
            <div className="bg-success/50">
                {completedTasks.length}
            </div>
            <div className="bg-danger/50">
                {overdueTasks.length}
            </div>
        </div>

      <div className="flex flex-col gap-3">
        {statsTasks.map((task) => (
          // <div key={task.id} className="bg-white rounded-3xl p-3 gap-2 flex flex-col cursor-pointer active:scale-105 transition" onClick={() => {router.push(`/task/${task.id}`)}}>
          <div key={task.id} className="bg-white rounded-3xl p-3 gap-2 flex flex-col cursor-pointer active:scale-105 transition">
                              <div className="flex justify-between">
                                  <span className="font-medium text-xl line-clamp-2">
                                      {task.type === "Расписание" ? task.subjectName : task.title}
                                  </span>
                                  {/* <span className="text-sm text-muted">
                                      {formatDate(task.deadline)}
                                  </span> */}
                              </div>
                              {task.description && (
                                  <div className="text-base font-regular text-gray-700 whitespace-pre-line">{task.description}</div>
                              )}
                              {/* {task.type === "Расписание" && (
                                  <div className="flex justify-between">
                                    <div className="flex gap-1 flex-wrap">
                                        <Chip variant="soft" size="lg">{formatDate(task.deadline)}</Chip>
                                        <Chip variant="soft" size="lg">{task.lessons} Пара</Chip>
                                    </div>
                                    <Chip color="accent" size="lg" variant="soft">
                                      {task.type}
                                    </Chip>
                                  </div>
                              )}
                              {task.type === "Кастомная" && (
                                  <div className="flex justify-between">
                                    <div className="flex gap-1 flex-wrap">
                                        <Chip variant="soft" size="lg">{formatDate(task.deadline)}</Chip>
                                    </div>
                                    <Chip color="warning" size="lg" variant="soft">
                                      {task.type}
                                    </Chip>
                                  </div>
                              )} */}

                              <div className="flex justify-between">
                                  <div className="flex gap-1 flex-wrap">
                                      {task.status == "completed" ? (
                                        <Chip color="success" variant="soft">Выполнено: {formatDate(task.deadline)}</Chip>
                                      ) : (
                                        <Chip color="danger" variant="soft">Дедлайн: {formatDate(task.deadline)}</Chip>
                                      )}
                                  </div>
                                </div>
                          </div>
        ))}
      </div>
    </div>
  );
}