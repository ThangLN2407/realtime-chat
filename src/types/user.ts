export interface UserType {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string | Date | null;
}

export interface FriendRequestType {
  id: string | null;
  fromDisplayName: string | null;
  photoURL: string | null;
  from: string;
  to: string;
  createdAt: string | Date | null;
  status: string;
}