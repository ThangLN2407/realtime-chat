import { BellOutlined } from "@ant-design/icons";
import { Dropdown, Skeleton, Badge, Button, message } from "antd";
import { FriendRequestType, UserType } from "../types/user";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { arrayUnion, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Avatar from "./Avatar";

type Props = {
  user: UserType | null;
  friendRequests: FriendRequestType[];
};

const Header = ({ user, friendRequests }: Props) => {
  const navigate = useNavigate();

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

  const handleAccept = async (inviteId: string, fromId: string) => {
    if (!user?.uid) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayUnion(fromId),
      });
      await updateDoc(doc(db, "users", fromId), {
        friends: arrayUnion(user.uid),
      });
      await deleteDoc(doc(db, "friendRequests", inviteId));
      message.success("Đã chấp nhận lời mời kết bạn!");
    } catch (error) {
      console.error("Chấp nhận lời mời thất bại", error);
    }
  };

  const handleReject = async (inviteId: string) => {
    try {
      await deleteDoc(doc(db, "friendRequests", inviteId));
      message.success("Đã xóa lời mời kết bạn!");
    } catch (error) {
      console.error("Xoá lời mời thất bại", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      message.error(`Đăng xuất thất bại:, ${error}`);
    }
  };

  return (
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
  );
};

export default Header;
