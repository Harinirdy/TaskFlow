
import { useState, useEffect, useRef } from "react";
import TaskList from "./components/TaskList";
import {
  tasks as initialTasks,
  type Task,
  type TaskCategory
} from "./types/task";
import "./App.css";
const normalizeTitle = (title: string) =>
  title.trim().toLowerCase().replace(/\s+/g, " ");
function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [taskList, setTaskList] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");

   return savedTasks
  ? (JSON.parse(savedTasks) as Task[]).map((task) => ({
      ...task,
      category: task.category ?? "Learning"
    }))
  : initialTasks;
  });

  const [taskTitle, setTaskTitle] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
  const savedTheme = localStorage.getItem("darkMode");
  return savedTheme === "true";
});
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const [priority, setPriority] =
    useState<Task["priority"]>("Medium");
const [category, setCategory] =
  useState<TaskCategory>("Learning");
  const [priorityFilter, setPriorityFilter] =
    useState<string>("All");
   const [categoryFilter, setCategoryFilter] =
  useState<string>("All"); 

  const [statusFilter, setStatusFilter] =
    useState<string>("All");

  const [sortOrder, setSortOrder] = useState<string>("None");

  const [editingTaskId, setEditingTaskId] =
    useState<number | null>(null);

  // Save tasks in localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(taskList));
  }, [taskList]);
  // Save theme preference in localStorage
useEffect(() => {
  localStorage.setItem("darkMode", String(darkMode));
}, [darkMode]);

  // Mark task as completed or pending
  const toggleTask = (id: number) => {
    setTaskList(
      taskList.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // Select task for editing
  const editTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setPriority(task.priority);
    setCategory(task.category);
    setDueDate(task.dueDate);
    setErrorMessage("");
  };
// Delete task
const deleteTask = (id: number) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this task?"
  );

  if (confirmDelete) {
    setTaskList(taskList.filter((task) => task.id !== id));
  }
};
  

  // Add new task
  const addTask = () => {
    if (taskTitle.trim() === "") {
      setErrorMessage("Please enter a task name.");
      return;
    }
  const isDuplicate = taskList.some(
  (task) =>
    normalizeTitle(task.title) === normalizeTitle(taskTitle) &&
    task.id !== editingTaskId
);

  if (isDuplicate) {
    setErrorMessage("This task already exists!");
    return;
  }
    if (dueDate === "") {
      setErrorMessage("Please select a due date.");
      return;
    }

    setErrorMessage("");

    const newTask: Task = {
      id: Date.now(),
      title: taskTitle.trim(),
      priority: priority,
      category: category,
      completed: false,
      dueDate: dueDate
    };

    setTaskList([...taskList, newTask]);


    setTaskTitle("");
    setPriority("Medium");
    setCategory("Learning");
    setDueDate("");
  };
// Update existing task
const updateTask = () => {
  if (taskTitle.trim() === "") {
    setErrorMessage("Please enter a task name.");
    return;
  }

  if (dueDate === "") {
    setErrorMessage("Please select a due date.");
    return;
  }
  const isDuplicate = taskList.some(
    (task) =>
      normalizeTitle(task.title) === normalizeTitle(taskTitle) &&
      task.id !== editingTaskId
  );
  if (isDuplicate) {
    setErrorMessage("Another task with this name already exists!");
    return;
  }

  setErrorMessage("");

  setTaskList(
    taskList.map((task) =>
      task.id === editingTaskId
        ? {
            ...task,
            title: taskTitle.trim(),
            priority: priority,
            category:category,
            dueDate: dueDate
          }
        : task
    )
  );

  setEditingTaskId(null);
  setTaskTitle("");
  setPriority("Medium");
  setCategory("Learning");
  setDueDate("");
};
 
  // Cancel editing
const cancelEdit = () => {
  setEditingTaskId(null);
  setTaskTitle("");
  setPriority("Medium");
  setCategory("Learning");
  setDueDate("");
  setErrorMessage("");
}; 
// Export tasks to CSV
const exportTasks = () => {
  const headers = [
    "ID",
    "Task Name",
    "Priority",
    "Category",
    "Status",
    "Due Date"
  ];
  
  const rows = taskList.map((task) => [
    task.id,
    task.title,
    task.priority,
    task.category,
    task.completed ? "Completed" : "Pending",
    task.dueDate
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((value) =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "my-tasks.csv";
  link.click();

  URL.revokeObjectURL(url);
};

// Import tasks from CSV
const importTasks = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    const csvText = await file.text();
    const lines = csvText.trim().split(/\r?\n/);

    const parseRow = (line: string) => {
      const values: string[] = [];
      let current = "";
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (insideQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === "," && !insideQuotes) {
          values.push(current);
          current = "";
        } else {
          current += char;
        }
      }

      values.push(current);
      return values;
    };

    const importedTasks: Task[] = [];
    let duplicateCount = 0;
    const validPriorities = ["Low", "Medium", "High"];
    const validCategories = ["Work", "Personal", "Learning", "Other"];

    let nextId =
      Math.max(0, ...taskList.map((task) => task.id)) + 1;

    for (const line of lines.slice(1)) {
      if (!line.trim()) continue;

      const [
        ,
        title,
        priority,
        category,
        status,
        dueDate
      ] = parseRow(line);

      if (
        !title?.trim() ||
        !validPriorities.includes(priority) ||
        !validCategories.includes(category) ||
        !dueDate?.trim() ||
        !["Completed", "Pending"].includes(status)
      ) {
        continue;
      }
      // Check for duplicate task names
      const normalizedTitle = normalizeTitle(title);

      const alreadyExists =
        taskList.some(
          (task) => normalizeTitle(task.title) === normalizedTitle
        ) ||
        importedTasks.some(
          (task) => normalizeTitle(task.title) === normalizedTitle
        );
if (alreadyExists) {
  duplicateCount++;
  continue;
}
    
      importedTasks.push({
        id: nextId++,
        title: title.trim(),
        priority: priority as Task["priority"],
        category: category as TaskCategory,
        completed: status === "Completed",
        dueDate: dueDate.trim()
      }); 
    }

    if (importedTasks.length > 0) {
      setTaskList((previousTasks) => [
        ...previousTasks,
        ...importedTasks
      ]);

    alert(
  `${importedTasks.length} tasks imported successfully. ${duplicateCount} duplicate tasks skipped.`
);
    } else {
  alert(`No new tasks imported. ${duplicateCount} duplicate tasks skipped.`);
}
  } catch {
    alert("Unable to read the CSV file.");
  }

  event.target.value = "";
};
  // Task Statistics
  const totalTasks = taskList.length;
  const workTasks = taskList.filter(
  (task) => task.category === "Work"
).length;

const personalTasks = taskList.filter(
  (task) => task.category === "Personal"
).length;

const learningTasks = taskList.filter(
  (task) => task.category === "Learning"
).length;

const otherTasks = taskList.filter(
  (task) => task.category === "Other"
).length;

  const completedTasks = taskList.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;
const today = new Date().toISOString().split("T")[0];

const overdueTasks = taskList.filter(
  (task) => !task.completed && task.dueDate < today
).length;
  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // Filter tasks by search, priority and status
  const filteredTasks = taskList.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;
const matchesCategory =
  categoryFilter === "All" || task.category === categoryFilter;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Completed" && task.completed) ||
      (statusFilter === "Pending" && !task.completed);

   return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  });
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOrder === "Priority") {
      const priorityOrder = {
        High: 3,
        Medium: 2,
        Low: 1
      };

      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    if (sortOrder === "DueDate") {
      return a.dueDate.localeCompare(b.dueDate);
    }

    return 0;
  });

  return (
  <div className={darkMode ? "dark-mode" : "light-mode"}>
    <h1>TaskFlow – Smart Task Management System</h1>
      <button
  onClick={() => setDarkMode(!darkMode)}
>
  {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>
<button onClick={exportTasks}>
  📥 Export Tasks to CSV
</button>
<button onClick={() => fileInputRef.current?.click()}>
  📂 Import Tasks from CSV
</button>

<input
  type="file"
  accept=".csv"
  ref={fileInputRef}
  onChange={importTasks}
  style={{ display: "none" }}
/>
{/* Task Statistics */}
<div className="stats-section">
  <h2>Task Statistics</h2>

  <div className="stats-grid">
    <div className="stat-card total">
      <h3>Total Tasks</h3>
      <p>{totalTasks}</p>
    </div>

    <div className="stat-card completed">
      <h3>Completed</h3>
      <p>{completedTasks}</p>
    </div>

    <div className="stat-card pending">
      <h3>Pending</h3>
      <p>{pendingTasks}</p>
    </div>

    <div className="stat-card progress">
      <h3>Progress</h3>
      <p>{completionPercentage}%</p>
    </div>
    <div className="stat-card overdue">
  <h3>Overdue Tasks</h3>
  <p>{overdueTasks}</p>
</div>
  </div>

  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: `${completionPercentage}%` }}
    />
  </div>
</div>
{/* Task Summary by Category */}
<div className="category-summary">
  <h2>Tasks by Category</h2>

  <div className="category-cards">
    <div className="category-card">
      <h3>Work</h3>
      <p>{workTasks}</p>
    </div>

    <div className="category-card">
      <h3>Personal</h3>
      <p>{personalTasks}</p>
    </div>

    <div className="category-card">
      <h3>Learning</h3>
      <p>{learningTasks}</p>
    </div>

    <div className="category-card">
      <h3>Other</h3>
      <p>{otherTasks}</p>
    </div>
  </div>
</div>
      {/* Task title input */}
      <div className="task-form">
      <input
        type="text"
        placeholder="Enter task name"
        value={taskTitle}
        onChange={(event) => {
          setTaskTitle(event.target.value);
          setErrorMessage("");
        }}
      />

      {/* Search Tasks */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />

      {/* Priority selection */}
      <select
        value={priority}
        onChange={(event) =>
          setPriority(event.target.value as Task["priority"])
        }
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
{/* Category selection */}
<select
  value={category}
  onChange={(event) =>
    setCategory(event.target.value as TaskCategory)
  }
>
  <option value="Work">Work</option>
  <option value="Personal">Personal</option>
  <option value="Learning">Learning</option>
  <option value="Other">Other</option>
</select>
      {/* Priority Filter */}
      <select
        value={priorityFilter}
        onChange={(event) => setPriorityFilter(event.target.value)}
      >
        <option value="All">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      {/* Category Filter */}
<select
  value={categoryFilter}
  onChange={(event) => setCategoryFilter(event.target.value)}
>
  <option value="All">All Categories</option>
  <option value="Work">Work</option>
  <option value="Personal">Personal</option>
  <option value="Learning">Learning</option>
  <option value="Other">Other</option>
</select>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
      >
        <option value="All">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>
      <button
  onClick={() => {
    setSearchText("");
    setPriorityFilter("All");
    setCategoryFilter("All");
    setStatusFilter("All");
    setSortOrder("None");
  }}
>
  Clear Filters
</button>

      {/* Sorting Options */}
      <select
        value={sortOrder}
        onChange={(event) => setSortOrder(event.target.value)}
      >
        <option value="None">Default Order</option>
        <option value="Priority">Priority: High to Low</option>
        <option value="DueDate">Due Date: Earliest to Latest</option>
      </select>

      {/* Due date selection */}
      <input
        type="date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
      />
<button
  onClick={editingTaskId !== null ? updateTask : addTask}
>
  {editingTaskId !== null ? "Update Task" : "Add Task"}
</button>

{editingTaskId !== null && (
  <button
    className="cancel-button"
    onClick={cancelEdit}
  >
    Cancel Edit
  </button>
)}
      
  </div>
      {/* Error Message */}
      {errorMessage && (
        <p style={{ color: "red" }}>
          {errorMessage}
        </p>
      )}

      {/* Display filtered and sorted tasks */}
      <TaskList
        tasks={sortedTasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onEdit={editTask}
      />
    </div>
  );
}

export default App;
