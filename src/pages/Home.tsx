import { Button } from "antd";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
    }
  };

  return (
    <div>
      Chào mừng trở lại, bệ hạ!
      <Button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Đăng xuất
      </Button>
    </div>
  );
};

export default Home;
