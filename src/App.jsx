import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, X, FileText } from "lucide-react";

const statusColors = {
  Pending: "bg-orange-100 text-orange-800 border-orange-200",
  "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
};

const statusOrder = ["Pending", "In Progress", "Completed"];

function App() {
  const [tasks, setTasks] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleAddTask = () => {
    if (formData.title.trim() && formData.description.trim()) {
      const newTask = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: "Pending",
      };
      setTasks([...tasks, newTask]);
      setFormData({ title: "", description: "" });
      setIsAddModalOpen(false);
    }
  };

  const handleEditTask = () => {
    if (editingTask && formData.title.trim() && formData.description.trim()) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: formData.title.trim(),
                description: formData.description.trim(),
              }
            : task
        )
      );
      setFormData({ title: "", description: "" });
      setEditingTask(null);
      setIsEditModalOpen(false);
    }
  };

  const toggleTaskStatus = (taskId) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const currentIndex = statusOrder.indexOf(task.status);
          const nextIndex = (currentIndex + 1) % statusOrder.length;
          return { ...task, status: statusOrder[nextIndex] };
        }
        return task;
      })
    );
  };

  const openAddModal = () => {
    setFormData({ title: "", description: "" });
    setIsAddModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description });
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingTask(null);
    setFormData({ title: "", description: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <Button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Add Task
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            </div>
            <p className="text-gray-500 mb-2">
              {tasks.length === 0
                ? "There are no records of Tasks yet."
                : "No tasks match your search."}
            </p>
            <p className="text-gray-400 mb-6">
              {tasks.length === 0 && "Please check back later."}
            </p>
            {tasks.length === 0 && (
              <Button
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Task
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="bg-white border border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => toggleTaskStatus(task.id)}
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {task.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      <Badge
                        variant="outline"
                        className={`${statusColors[task.status]} font-medium`}
                      >
                        {task.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(task)}
                      className="text-gray-400 hover:text-gray-600 ml-4"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Task Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="add-title">
                  Title <span className="text-blue-600">*</span>
                </Label>
                <Input
                  id="add-title"
                  placeholder="A title for the task"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-description">
                  Description <span className="text-blue-600">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="add-description"
                    placeholder="A brief about the task"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    maxLength={200}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {formData.description.length}/200
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={closeModals}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTask}
                  disabled={
                    !formData.title.trim() || !formData.description.trim()
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Task Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModals}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">
                  Title <span className="text-blue-600">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">
                  Description <span className="text-blue-600">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    maxLength={200}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {formData.description.length}/200
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={closeModals}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditTask}
                  disabled={
                    !formData.title.trim() || !formData.description.trim()
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Edit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default App;
