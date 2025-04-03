import { useEffect } from "react";
import { auth, provider } from "../../firebaseConfig";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function AuthComponent({ onAuthSuccess }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onAuthSuccess({
          name: user.displayName || "Usuário",
          email: user.email,
        });
      } else {
        onAuthSuccess(null);
      }
    });

    return () => unsubscribe();
  }, [onAuthSuccess]);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      onAuthSuccess({
        name: result.user.displayName || "Usuário",
        email: result.user.email,
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    onAuthSuccess(null);
  };

  return (
    <div className="p-6 space-y-4 text-center">
      <button onClick={signIn} className="bg-blue-500 text-white px-4 py-2 rounded">
        Sign in with Google
      </button>
    </div>
  );
}
