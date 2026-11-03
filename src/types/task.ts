export type TaskCategory =
  | "Work"
  | "Personal"
  | "Learning"
  | "Other";
export interface Task {
  id: number;
  title: string;
  priority: "Low" | "Medium" | "High";
  category: TaskCategory;
  completed: boolean;
  dueDate: string;
}

export const sampleTask: Task = {
  id: 1,
  title: "Learn TypeScript",
  priority: "High",
  category:"Learning",
  completed: false,
  dueDate: "2026-11-05"
};

export const tasks: Task[] = [
  {
    id: 1,
    title: "Learn TypeScript",
    priority: "High",
      category:"Learning",
    completed: false,
    dueDate: "2026-11-05"
  },
  {
    id: 2,
    title: "Learn React Hooks",
    priority: "Medium",
      category:"Learning",
    completed: true,
    dueDate: "2026-11-06"
  },
  {
    id: 3,
    title: "Practice React Components",
    priority: "Low",
    category:"Work",
    completed: false,
    dueDate: "2026-11-07"
  },
  {
    id: 4,
    title: "Practice TypeScript",
    priority: "Low",
      category:"Learning",
    completed: true,
    dueDate: "2026-11-09"
  }
];