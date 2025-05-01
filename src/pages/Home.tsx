import { Badge, Button, Dropdown, Input, message, Modal, Skeleton } from "antd";
import type { MenuProps } from "antd";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { FriendRequestType, UserType } from "../types/user";
import Avatar from "../components/Avatar";
import { BellOutlined } from "@ant-design/icons";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<UserType | null>(null);
  const [modal, setModal] = useState<{ visible: boolean; notFound: boolean }>({
    visible: false,
    notFound: false,
  });
  const [friendRequests, setFriendRequests] = useState<FriendRequestType[]>([]);

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
        if (user?.uid === targetUser.uid) {
          message.error("Bạn không thể gửi lời mời cho chính mình!");
          return;
        }
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

  const handleAccept = async (inviteId: string, fromId: string) => {
    if (!user?.uid) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayUnion(fromId),
      });
      await updateDoc(doc(db, "users", fromId), {
        friends: arrayUnion(fromId),
      });
      await deleteDoc(doc(db, "friendRequests", inviteId));
      message.success("Đã chấp nhận lời mời kết bạn!");
    } catch (error) {
      console.error("Chấp nhận lời mời thất bại", error);
    }
  };

  const handleReject = async (inviteId: string) => {
    try {
      // await deleteDoc(doc(db, "friendRequests", inviteId));

      const inviteRef = doc(db, "friendRequests", inviteId);
      await updateDoc(inviteRef, {
        status: "rejected",
      });
      message.success("Đã xóa lời mời kết bạn!");
    } catch (error) {
      console.error("Xoá lời mời thất bại", error);
    }
  };

  const sendFriendRequest = async () => {
    if (!foundUser) return;

    try {
      await addDoc(collection(db, "friendRequests"), {
        from: user?.uid,
        to: foundUser?.uid,
        fromDisplayName: user?.displayName,
        photoURL: user?.photoURL,
        createdAt: serverTimestamp(),
        status: "pending",
      });
      message.success("Đã gửi lời mời kết bạn!");
    } catch (error) {
      console.error("Gửi lời mời thất bại", error);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "friendRequests"),
      where("to", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const invites = snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          } as FriendRequestType;
        });
        setFriendRequests(invites);
        if (invites.length > 0) {
          message.success("Bạn có lời mời kết bạn!");
        }
      },
      (error) => {
        console.error("🔥 Lỗi snapshot listener:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const menuItems: MenuProps["items"] =
    friendRequests.length === 0
      ? [
          {
            key: "no-invite",
            label: "Không có lời mời",
            disabled: true,
          },
        ]
      : (friendRequests.map((friend: FriendRequestType) => ({
          key: friend.id ?? "unknown-key",
          label: (
            <div className="flex items-end justify-between gap-2">
              <div className="font-semibold min-w-[150px]">
                {friend.fromDisplayName}
              </div>
              <div className="flex gap-4 mt-1">
                <Button
                  type="primary"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAccept(String(friend.id), friend.from);
                  }}
                >
                  Chấp nhận
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    handleReject(String(friend.id));
                  }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          ),
        })) as MenuProps["items"]);

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
            <Badge count={friendRequests.length} offset={[-5, 5]}>
              <Button icon={<BellOutlined />} />
            </Badge>
          </Dropdown>

          <Button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-[500px]">
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
                  sendFriendRequest();
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
