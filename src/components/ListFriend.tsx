import { FriendType } from "../types/user";
import Avatar from "./Avatar";

type Props = {
  friends: FriendType[] | [];
};

const ListFriend = ({ friends }: Props) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">👑 Danh sách bạn bè</h2>
      <div className="space-y-2">
        {friends.map((friend) => (
          <div
            key={friend.uid}
            className="flex items-center gap-4 bg-gray-50 p-2 rounded hover:shadow"
          >
            <Avatar src={friend.photoURL} />
            <span className="font-medium">{friend.displayName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListFriend;
