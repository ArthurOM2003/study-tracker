import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function StudyTrackingDashboard() {
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
  const [view, setView] = useState("home");
  const [studyData, setStudyData] = useState([]);
  const [selectedStatSubject, setSelectedStatSubject] = useState(null);

  const addStudyData = () => {
    if (correct && incorrect && timeSpent) {
      setStudyData([...studyData, { date, correct: Number(correct), incorrect: Number(incorrect), timeSpent: Number(timeSpent), subject: selectedSubject }]);
      setCorrect("");
      setIncorrect("");
      setTimeSpent("");
    }
  };

  const filteredData = selectedStatSubject
    ? studyData.filter((data) => data.subject === selectedStatSubject)
    : studyData;

  const totalQuestions = filteredData.reduce((sum, data) => sum + data.correct + data.incorrect, 0);
  const totalTimeSpent = filteredData.reduce((sum, data) => sum + data.timeSpent, 0);
  const avgTimeSpent = filteredData.length ? (totalTimeSpent / filteredData.length).toFixed(2) : 0;
  const accuracy = totalQuestions ? ((filteredData.reduce((sum, data) => sum + data.correct, 0) / totalQuestions) * 100).toFixed(2) : 0;

  return (
    <div className="p-6 space-y-6">
      {view === "home" ? (
        <div>
          <h1 className="text-2xl font-bold text-center">Study Tracking Dashboard</h1>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="cursor-pointer" onClick={() => setView("stats")}>
              <CardContent className="p-4 text-center">
                <h2 className="text-lg font-semibold">View Statistics</h2>
              </CardContent>
            </Card>
            <Card className="cursor-pointer" onClick={() => setView("add")}>
              <CardContent className="p-4 text-center">
                <h2 className="text-lg font-semibold">Add Study Data</h2>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : view === "add" ? (
        <div>
          <h1 className="text-2xl font-bold">Add Study Data</h1>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input placeholder="Correct" type="number" value={correct} onChange={(e) => setCorrect(e.target.value)} />
              <Input placeholder="Incorrect" type="number" value={incorrect} onChange={(e) => setIncorrect(e.target.value)} />
              <Input placeholder="Time Spent (min)" type="number" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} />
              <select className="border p-2" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
              <Button onClick={addStudyData}>Add</Button>
            </div>
          </div>
          <Button onClick={() => setView("home")} className="fixed bottom-4 left-4">Back</Button>
        </div>
      ) : view === "stats" ? (
        <div>
          <h1 className="text-2xl font-bold">Statistics</h1>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="p-4 text-center rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold">Avg Time Spent</h2>
              <p className="text-xl font-bold">{avgTimeSpent} min</p>
            </Card>
            <Card className="p-4 text-center rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold">Total Questions</h2>
              <p className="text-xl font-bold">{totalQuestions}</p>
            </Card>
            <Card className="p-4 text-center rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold">Accuracy</h2>
              <p className="text-xl font-bold">{accuracy}%</p>
            </Card>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-6">
            <Button onClick={() => setSelectedStatSubject(null)}>All Subjects</Button>
            {subjects.map((subj) => (
              <Button key={subj} onClick={() => setSelectedStatSubject(subj)}>{subj}</Button>
            ))}
          </div>
          <div className="mt-6">
            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="correct" fill="#4CAF50" name="Correct" />
                  <Bar dataKey="incorrect" fill="#F44336" name="Incorrect" />
                  <Bar dataKey="timeSpent" fill="#2196F3" name="Time Spent (min)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500">No data available.</p>
            )}
          </div>
          <Button onClick={() => setView("home")} className="fixed bottom-4 left-4">Back</Button>
        </div>
      ) : null}
    </div>
  );
}
