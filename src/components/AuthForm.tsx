import { Button, Form, Input, message } from "antd";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { AuthInfo } from "../types/auth";
import { Link, useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../services/auth";
import { saveUserToFireStore } from "../services/user";

type Props = {
  isLogin: boolean;
};
const AuthForm = ({ isLogin }: Props) => {
  const navigate = useNavigate();

  const onFinish = async (values: AuthInfo) => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        message.success("Đăng nhập thành công!");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;

        await saveUserToFireStore(user.uid, values.email);
        message.success("Đăng ký thành công!");
        navigate("/login");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("error", error);
        message.error(error.message);
      }
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (error: unknown) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <Form
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 400, margin: "auto" }}
    >
      <Form.Item label="Email" name="email" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Mật khẩu" name="password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Button type="primary" htmlType="submit" block>
        {isLogin ? "Đăng nhập" : "Đăng ký"}
      </Button>

      <div className="mt-4 mb-4 space-y-2">
        <Button onClick={handleGoogle} block>
          Đăng nhập bằng Google
        </Button>
      </div>

      {isLogin && (
        <p className="mt-4 text-sm">
          Chưa có tài khoản?
          <Link to="/register" className="text-blue-500 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      )}
      {!isLogin && (
        <p className="mt-4 text-sm">
          Đã có tài khoản?
          <Link to="/login" className="text-blue-500 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      )}
    </Form>
  );
};

export default AuthForm;
