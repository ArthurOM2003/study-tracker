import { useState } from "react";
import { useRouter } from "next/router"; // Importando o router para redirecionamento
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { app } from "../firebaseConfig";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function AuthPage({ setUser }) {
  const router = useRouter(); // Instância do router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      setUser(userCredential.user);
      router.push("/paga"); // Redireciona para paga.jsx após login/registro
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      router.push("/paga"); // Redireciona para paga.jsx após login com Google
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-2xl font-bold">{isRegister ? "Register" : "Login"}</h1>
      <form onSubmit={handleAuth} className="flex flex-col space-y-2">
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="border p-2 rounded"
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {isRegister ? "Register" : "Login"}
        </button>
      </form>
      <button onClick={handleGoogleSignIn} className="bg-red-500 text-white px-4 py-2 rounded">
        Sign in with Google
      </button>
      <p onClick={() => setIsRegister(!isRegister)} className="cursor-pointer text-blue-500">
        {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
      </p>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}