import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { UserType } from "../types/user";
import { useAuth } from "./AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Props {
  readonly children: ReactNode;
}

const UserContext = createContext<UserType | null>(null);

export const UserProvider = ({ children }: Props) => {
  const { currentUser } = useAuth();
  const [appUser, setAppUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setAppUser(userDoc.data() as UserType);
        }
      } else {
        setAppUser(null);
      }
    };
    fetchUser();
  }, [currentUser]);

  return (
    <UserContext.Provider value={appUser}>{children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
