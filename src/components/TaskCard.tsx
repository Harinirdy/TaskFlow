
import type { Task } from "../types/task";

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

function TaskCard({ task, onToggle, onDelete, onEdit }: TaskCardProps) {
  return (
    <div className="task-card">
      <h3>{task.title}</h3>

      <p>
        Priority:
        <span className={`priority-badge ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
      </p>
<p>
  Category: {task.category}
</p>
      <p>
        Status: {task.completed ? "Completed" : "Pending"}
      </p>

      <p>
  Due Date: {task.dueDate}
</p>

{!task.completed && task.dueDate < new Date().toISOString().split("T")[0] && (
  <p className="overdue-message">
    This task is overdue!
  </p>
)}

      <div className="task-actions">
        <button onClick={() => onToggle(task.id)}>
          {task.completed ? "Mark as Pending" : "Mark as Completed"}
        </button>

        <button onClick={() => onEdit(task)}>
          Edit
        </button>

        <button className="delete-button" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
