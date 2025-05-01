import { Button, Dropdown, Input, message, Modal, Skeleton } from "antd";
import type { MenuProps } from "antd";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { UserType } from "../types/user";
import Avatar from "../components/Avatar";
import { BellOutlined } from "@ant-design/icons";

const mockFriendRequests = [
  { id: "1", name: "Nguyễn Văn A", email: "a@gmail.com" },
  { id: "2", name: "Trần Thị B", email: "b@gmail.com" },
];

const Home = () => {
  const navigate = useNavigate();

  const { user } = useUser();

  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<UserType | null>(null);
  const [modal, setModal] = useState<{ visible: boolean; notFound: boolean }>({
    visible: false,
    notFound: false,
  });

  // const [friendRequests, setFriendRequests] = useState(mockFriendRequests);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      message.error(`Đăng xuất thất bại:, ${error}`);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail) return;

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", searchEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const targetUser = querySnapshot.docs[0].data() as UserType;
        setFoundUser(targetUser);
        setModal({ visible: true, notFound: false });
      } else {
        setFoundUser(null);
        setModal({ visible: true, notFound: true });
      }
    } catch (err) {
      console.log("🚀 ~ handleSearch ~ err:", err);
    }
  };

  const handleAccept = (id: string) => {
    console.log("Chấp nhận lời mời:", id);
  };

  const handleReject = (id: string) => {
    console.log("Xoá lời mời:", id);
  };

  const menuItems: MenuProps["items"] =
    mockFriendRequests.length === 0
      ? [
          {
            key: "no-invite",
            label: "Không có lời mời",
            disabled: true,
          },
        ]
      : mockFriendRequests.map((user) => ({
          key: user.id,
          label: (
            <div className="flex items-end justify-between gap-2">
              <div className="font-semibold min-w-[150px]">{user.name}</div>
              <div className="flex gap-4 mt-1">
                <Button
                  type="primary"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAccept(user.id);
                  }}
                >
                  Chấp nhận
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    handleReject(user.id);
                  }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          ),
        }));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex justify-between items-center bg-white shadow p-4">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span>
            <Avatar src={user?.photoURL} />
          </span>
          <span>
            {user?.displayName ?? <Skeleton.Input active></Skeleton.Input>}
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <Dropdown
            menu={{ items: menuItems }}
            placement="bottomRight"
            arrow
            trigger={["click"]}
          >
            <Button icon={<BellOutlined />} />
          </Dropdown>

          <Button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">🔍 Tìm bạn bè</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Nhập email người bạn"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            <Button type="primary" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </div>
        </div>
      </main>

      {/* Modal tim ban */}
      <Modal
        open={modal.visible}
        onCancel={() => setModal({ visible: false, notFound: false })}
        footer={null}
      >
        {modal.notFound ? (
          <p>👻 Không tìm thấy người dùng với email: {searchEmail}</p>
        ) : (
          <div className="space-y-2">
            <p>
              ✨ Tìm thấy người dùng:{" "}
              {foundUser?.displayName ?? foundUser?.email}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setModal({ visible: false, notFound: false })}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setModal({ visible: false, notFound: false });
                }}
              >
                Gửi lời mời
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
