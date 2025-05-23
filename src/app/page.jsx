"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebaseConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AuthComponent from "./auth/AuthComponent";
import { db } from "@/firebaseConfig"; // Certifique-se de que seu arquivo firebaseConfig está configurado corretamente
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { deleteDoc, doc } from "firebase/firestore";
import { ToastContainer } from "react-toastify";

export default function StudyTrackingDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [view, setView] = useState("home");
  
  useEffect(() => {
    let inputSequence = "";
    const targetWord = "angelica";
  
    const handleKeyPress = (event) => {
      inputSequence += event.key.toLowerCase();
      if (inputSequence.includes(targetWord)) {
        toast("❤️ Te amo ❤️", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          style: { backgroundColor: "red", color: "white", fontWeight: "bold" },
        });
        inputSequence = ""; // Reset após a ativação
      }
  
      if (inputSequence.length > targetWord.length) {
        inputSequence = inputSequence.slice(-targetWord.length); // Mantém apenas os últimos caracteres digitados
      }
    };
  
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUsername(user.displayName || "Usuário");
      } else {
        setIsAuthenticated(false);
        setUsername("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setUsername("");
  };

  return (
    
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 space-y-6">
       <ToastContainer /> {/* Certifique-se de que ele está aqui */}
       <div className="flex justify-between items-center px-4 bg-white shadow-lg rounded-lg w-full max-w-4xl">
       <img src="/logo.png" alt="Logo" className="w-64 h-36 object-contain" /> 
  <h2 className="text-lg font-bold text-gray-700">
    {isAuthenticated ? `Bem-vindo, ${username}!` : "Study Tracker"}
  </h2>
  <div>
    {isAuthenticated ? (
      <Button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600">
        Logout
      </Button>
    ) : (
      <AuthComponent />
    )}
  </div>
</div>

      {isAuthenticated && (
        <DashboardContent username={username} setView={setView} view={view} />
      )}
    </div>
  );
}

function DashboardContent({ username, setView, view }) {
  const subjects = [
    "CARDIO", "RENAL", "PNEUMO", "GI", "ENDOCRINE", "REPRODUCTIVE", "BEHAVIORAL / PSYCH",
    "NEURO", "MSK", "DERMATO", "PATH BASICS", "HEMATO/ONCO", "IMMUNO", "MICRO / INFECTIOUS",
    "BIOCHEM / GENETICS", "CELL BIOLOGY", "BIOSTAS / BASIC PHARM"
  ];

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [correct, setCorrect] = useState("");
  const [incorrect, setIncorrect] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("CARDIO");
  const [studyData, setStudyData] = useState([]);
  const [selectedStatSubject, setSelectedStatSubject] = useState(null);
  const totalGlobalQuestions = studyData.reduce((sum, d) => sum + d.correct + d.incorrect, 0);
const totalGlobalTimeSpent = studyData.reduce((sum, d) => sum + d.timeSpent, 0);
const avgGlobalTimePerQuestion = totalGlobalQuestions ? (totalGlobalTimeSpent / totalGlobalQuestions).toFixed(2) : "0";
const globalAccuracy = totalGlobalQuestions ? ((studyData.reduce((sum, d) => sum + d.correct, 0) / totalGlobalQuestions) * 100).toFixed(2) : "0";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const { correct, incorrect, timeSpent } = payload[0].payload;
    const totalQuestions = correct + incorrect;
    const timePerQuestion = totalQuestions ? (timeSpent / totalQuestions).toFixed(2) : 0;
    const timehours = (timeSpent / 60).toFixed(1);

    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-md">
        <p><strong>Data:</strong> {label}</p>
        <p><strong>Corretas:</strong> {correct}</p>
        <p><strong>Incorretas:</strong> {incorrect}</p>
        <p><strong>Tempo Total:</strong> {timeSpent} min / {timehours} h</p>
        <p><strong>Tempo por Questão:</strong> {timePerQuestion} min</p>
      </div>
    );
  }

  return null;
}

  useEffect(() => {
    if (auth.currentUser) {
      const fetchAllStudyData = async () => {
        const q = query(collection(db, "studyData"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudyData(data);
      };
      fetchAllStudyData();
    }
  }, []);

  useEffect(() => {
    if (view === "stats" && auth.currentUser) {
      const fetchStudyData = async () => {
        const q = query(collection(db, "studyData"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudyData(data);
      };
      fetchStudyData();
    }
  }, [view]);

  const deleteStudyData = async (entryId) => {
    try {
      await deleteDoc(doc(db, "studyData", entryId));
      setStudyData(studyData.filter((entry) => entry.id !== entryId));
      toast.success("Registro excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir o registro.");
      console.error("Erro ao deletar entrada:", error);
    }
  };

  const addStudyData = async () => {
    if (correct && incorrect && timeSpent) {
      const newEntry = {
        userId: auth.currentUser.uid,  // Salva o ID do usuário logado
        date,
        correct: Number(correct),
        incorrect: Number(incorrect),
        timeSpent: Number(timeSpent),
        subject: selectedSubject
      };
  
      try {
        await addDoc(collection(db, "studyData"), newEntry);
        setStudyData([...studyData, newEntry]);
        setCorrect("");
        setIncorrect("");
        setTimeSpent("");
        toast.success("Registro adicionado com sucesso!");
      } catch (error) {
        toast.error("Erro ao salvar no Firestore.");
        console.error("Erro ao salvar no Firestore: ", error);
      }
    }
  };

  const filteredData = selectedStatSubject
    ? studyData.filter((data) => data.subject === selectedStatSubject)
    : [];

    const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalQuestions = filteredData.reduce((sum, data) => sum + data.correct + data.incorrect, 0);
  const totalTimeSpent = filteredData.reduce((sum, data) => sum + data.timeSpent, 0);
  const avgTimePerQuestion = totalQuestions ? (totalTimeSpent / totalQuestions).toFixed(2) : 0;;
  const accuracy = totalQuestions ? ((filteredData.reduce((sum, data) => sum + data.correct, 0) / totalQuestions) * 100).toFixed(2) : 0;

  return (
    <div>
      {view === "home" ? (
        <div>
          <h1 className="text-2xl font-bold text-center">Study Tracking Dashboard</h1>
          <h2 className="text-1xl font-bold text-center h-20z">General Statistics</h2>
          <div className="flex justify-center items-center gap-6 mt-6">
  <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80 h-36 border border-gray-200">
    <p className="text-md font-semibold text-gray-600">Total Questões</p>
    <p className="text-3xl font-bold text-gray-900 mt-2">{totalGlobalQuestions}</p>
  </div>
  <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80 h-36 border border-gray-200">
    <p className="text-md font-semibold text-gray-600">Tempo Médio</p>
    <p className="text-3xl font-bold text-gray-900 mt-2">{avgGlobalTimePerQuestion} min</p>
  </div>
  <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80 h-36 border border-gray-200">
    <p className="text-md font-semibold text-gray-600">Precisão</p>
    <p className="text-3xl font-bold text-gray-900 mt-2">{globalAccuracy}%</p>
  </div>
</div>
          <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="cursor-pointer bg-white shadow-md hover:shadow-lg transition transform hover:-translate-y-1 rounded-lg" onClick={() => setView("stats")}>
  <CardContent className="p-6 text-center">
    <h2 className="text-lg font-bold text-gray-700">📊 Ver Estatísticas</h2>
  </CardContent>
</Card>
            <Card className="cursor-pointer bg-white shadow-md hover:shadow-lg transition transform hover:-translate-y-1 rounded-lg" onClick={() => setView("add")}>
              <CardContent className="p-6 text-center">
                <h2 className="text-lg font-bold text-gray-700">➕ Adicionar Dados</h2>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : view === "add" ? (
        <div>
          <Button onClick={() => setView("home")} 
  className="fixed bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition">
  Voltar
</Button>
          <h1 className="text-2xl font-bold">Add Study Data</h1>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-2" />
          <select className="border p-2 mb-2" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
          <p>Correct Answers</p>
          <Input type="number" placeholder="Correct Answers" value={correct} onChange={(e) => setCorrect(e.target.value)} className="mb-2" />
          <p>Incorrect Answers</p>
          <Input type="number" placeholder="Incorrect Answers" value={incorrect} onChange={(e) => setIncorrect(e.target.value)} className="mb-2" />
          <p>Time Spent (minutes)</p>
          <Input type="number" placeholder="Time Spent (minutes)" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} className="mb-2" />
          <Button onClick={addStudyData} className="bg-blue-500 text-white">Add</Button>
        </div>
      ) : view === "stats" ? (
        <div>
          <Button onClick={() => setView("home")} className="fixed bottom-4 left-4">Back</Button>
          <h1 className="text-2xl font-bold">Statistics</h1>

          <label className="block mt-4 mb-2">Select Subject:</label>
          <select className="border p-2 mb-4" value={selectedStatSubject || ""} onChange={(e) => setSelectedStatSubject(e.target.value || null)}>
            <option value="">-- Select a Subject --</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>

          {selectedStatSubject && (
  <div className="mt-6">
    {/* Indicadores de Desempenho */}
    <div className="flex justify-center items-center gap-6 mb-6">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80 h-36 border border-gray-200">
        <p className="text-md font-semibold text-gray-600">Total Questions</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{totalQuestions}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80 h-36 border border-gray-200">
        <p className="text-md font-semibold text-gray-600">Avg Time Per Question</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{avgTimePerQuestion} min</p>
    </div>
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80 h-36 border border-gray-200">
        <p className="text-md font-semibold text-gray-600">Accuracy</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{accuracy}%</p>
      </div>
    </div>

    {/* Gráfico */}
    <ResponsiveContainer width="100%" height={300} className="bg-white p-4 rounded-lg shadow-md">
  <BarChart data={sortedData}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip content={<CustomTooltip />} />
    <Legend />
    <Bar dataKey="correct" fill="#82ca9d" />
    <Bar dataKey="incorrect" fill="#ff4d4d" />
  </BarChart>
</ResponsiveContainer>
        {/* Lista de Registros e Botão de Exclusão */}
        <div className="mt-6 space-y-4">
      {filteredData.map((data) => (
        <div key={data.id} className="flex justify-between items-center p-4 border-b">
          <p>{data.date} - {data.subject}: {data.correct} acertos, {data.incorrect} erros</p>
          <Button onClick={() => deleteStudyData(data.id)} className="bg-red-500 text-white">
            Excluir
          </Button>
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      ) : null}
    </div>
  );
}
