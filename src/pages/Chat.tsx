import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Button, Input } from "antd";

const Chat = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<any[] | null>([]);
  console.log("🚀 ~ Chat ~ messages:", messages);
  const [newMessage, setNewMessage] = useState("");

  const chatId = "user1_user2";

  const messagesRef = collection(db, "chats", chatId, "messages");

  useEffect(() => {
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(messagesRef, {
      text: newMessage,
      senderId: currentUser?.uid,
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="max-w-xl mx-auto mt-6 border p-4 rounded-lg shadow space-y-4">
      <div className="h-80 overflow-y-auto space-y-2 border p-2 rounded">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded ${
              msg.senderId === currentUser?.uid
                ? "bg-blue-100 text-right"
                : "bg-gray-100 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onPressEnter={sendMessage}
        />
        <Button type="primary" onClick={sendMessage}>
          Gửi
        </Button>
      </div>
    </div>
  );
};

export default Chat;
