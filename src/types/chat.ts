export interface MessageIdType {
  senderId: string
  text: string
  createdAt: Date | string
}

export interface ChatIdType {
  participants: string[]
}