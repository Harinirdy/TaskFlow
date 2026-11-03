import type { Task } from "../types/task";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

function TaskList({ tasks, onToggle, onDelete, onEdit }: TaskListProps) {
  return (
    <div>
      <h2>My Tasks</h2>
{tasks.length === 0 ? (
  <p className="empty-message">
    No tasks found. Add a new task to get started!
  </p>
) : (
  tasks.map((task) => (
    <TaskCard
      key={task.id}
      task={task}
      onToggle={onToggle}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  ))
)}
     
    </div>
  );
}

export default TaskList;