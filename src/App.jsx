import { useState, useEffect, useRef } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mic,
  MicOff,
  Square,
  Edit,
  X,
  FileText,
  Volume2,
  RefreshCw,
  Check,
  AlertCircle,
  Keyboard,
} from "lucide-react";

const statusColors = {
  Pending: "bg-orange-100 text-orange-800 border-orange-200",
  "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
};

const statusOrder = ["Pending", "In Progress", "Completed"];

function VoiceInputSection({
  onConfirm,
  actionLabel = "Create",
  formData,
  setFormData,
  onClose,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [showTranscription, setShowTranscription] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState("prompt");
  const [useTextFallback, setUseTextFallback] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        navigator.permissions?.query({ name: "microphone" }).then((result) => {
          setMicrophonePermission(result.state);
        });
      }
    }
  }, []);

  const parseVoiceInput = (text) => {
    text = text.toLowerCase();

    let title = "";
    let description = "";

    const titleMatch = text.match(/(?:title(?: is)?|titled)\s+([^.?!]*)/i);
    const descMatch = text.match(
      /(?:description(?: is)?|about|details|it is)\s+([^.?!]*)/i
    );

    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    if (descMatch) {
      description = descMatch[1].trim();
    }

    if (!title && !description) {
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
      if (sentences.length >= 2) {
        title = sentences[0].trim();
        description = sentences.slice(1).join(". ").trim();
      } else {
        title = text.trim();
      }
    }

    return { title, description };
  };

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      setVoiceError("Speech recognition not supported in this browser");
      return;
    }

    setIsListening(true);
    setVoiceError("");
    setTranscribedText("");
    setShowTranscription(false);

    let finalTranscriptResult = "";

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        finalTranscriptResult = finalTranscript;
      }

      setTranscribedText(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setIsProcessing(false);

      const textToProcess = finalTranscriptResult.trim();

      if (textToProcess) {
        setTranscribedText(textToProcess);
        setShowTranscription(true);
        const parsed = parseVoiceInput(textToProcess);
        setFormData(parsed);
      } else if (transcribedText.trim()) {
        setShowTranscription(true);
        const parsed = parseVoiceInput(transcribedText);
        setFormData(parsed);
      }
    };

    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
      setIsProcessing(false);
      if (event.error === "not-allowed") {
        setVoiceError(
          "Microphone access denied. Please enable microphone permissions."
        );
        setMicrophonePermission("denied");
      } else {
        setVoiceError(`Voice recognition error: ${event.error}`);
      }
    };

    recognitionRef.current.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      setIsProcessing(true);
      recognitionRef.current.stop();
    }
  };

  const confirmVoiceInput = () => {
    setShowTranscription(false);
    setTranscribedText("");
  };

  const retryVoiceInput = () => {
    setShowTranscription(false);
    setTranscribedText("");
    startVoiceInput();
  };

  const switchToTextInput = () => {
    setUseTextFallback(true);
    setShowTranscription(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4">
          <Button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={isProcessing}
            className={`w-24 h-24 rounded-full text-white transition-all duration-200 ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isProcessing ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : isListening ? (
              <Square className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          {isListening
            ? "🎤 Listening... Speak your task title and description"
            : isProcessing
            ? "Processing your voice input..."
            : "Tap to speak your task details"}
        </p>

        {isListening && (
          <p className="text-xs text-gray-500">
            Say something like: "Update website design. Make the homepage more
            modern and user-friendly"
          </p>
        )}
      </div>

      {transcribedText && !showTranscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Live Transcription
            </span>
          </div>
          <p className="text-gray-700 italic">"{transcribedText}"</p>
        </div>
      )}

      {showTranscription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Voice Input Captured
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Detected Title:
              </Label>
              <p className="text-gray-900 font-medium">
                {formData.title || "Not detected"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Detected Description:
              </Label>
              <p className="text-gray-700">
                {formData.description || "Not detected"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={confirmVoiceInput}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Looks Good
            </Button>
            <Button
              onClick={retryVoiceInput}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={switchToTextInput}
              variant="outline"
              className="flex-1"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Type Instead
            </Button>
          </div>
        </div>
      )}

      {useTextFallback && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Text Input Mode
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>
      )}
      {voiceError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {voiceError}
            {microphonePermission === "denied" && (
              <Button
                onClick={() => setUseTextFallback(true)}
                variant="link"
                className="p-0 h-auto text-red-700 underline ml-2"
              >
                Use text input instead
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!formData.title.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({ title: "", description: "" });

  const searchRecognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        searchRecognitionRef.current = new SpeechRecognition();
        searchRecognitionRef.current.continuous = false;
        searchRecognitionRef.current.interimResults = false;
        searchRecognitionRef.current.lang = "en-US";
      }
    }
  }, []);

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleAddTask = () => {
    if (formData.title.trim()) {
      const newTask = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim() || "No description provided",
        status: "Pending",
      };
      setTasks([...tasks, newTask]);
      resetForm();
      setIsAddModalOpen(false);
    }
  };

  const handleEditTask = () => {
    if (editingTask && formData.title.trim()) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: formData.title.trim(),
                description: formData.description.trim() || task.description,
              }
            : task
        )
      );
      resetForm();
      setEditingTask(null);
      setIsEditModalOpen(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "" });
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
    resetForm();
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
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Voice Task Tracker
          </h1>
          <Button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            Add Task
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="Search tasks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6">
              <div className="relative">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <Mic className="w-6 h-6 text-blue-500 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
              </div>
            </div>
            <p className="text-gray-500 mb-2">
              {tasks.length === 0
                ? "No tasks yet. Use your voice to get started!"
                : "No tasks match your search."}
            </p>
            <p className="text-gray-400 mb-6">
              {tasks.length === 0 &&
                "Tap the microphone and speak your first task."}
            </p>
            {tasks.length === 0 && (
              <Button
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Speak Your First Task
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

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                Add New Task with Voice
              </DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <VoiceInputSection
                onConfirm={handleAddTask}
                actionLabel="Create Task"
                formData={formData}
                setFormData={setFormData}
                onClose={closeModals}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                Edit Task with Voice
              </DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <VoiceInputSection
                onConfirm={handleEditTask}
                actionLabel="Update Task"
                formData={formData}
                setFormData={setFormData}
                onClose={closeModals}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
