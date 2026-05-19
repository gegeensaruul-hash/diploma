import User from "./userModel.js";
import Todo from "./todoModel.js";
import Category from "./categoryModel.js";
import ChatRoom from "./chatRoomModel.js";
import ChatMessage from "./chatMessageModel.js";
import RoomMember from "./roomMemberModel.js";

// User -> Todo
User.hasMany(Todo, { foreignKey: "userId", as: "todos", onDelete: "CASCADE" });
Todo.belongsTo(User, { foreignKey: "userId", as: "user" });

// User -> Category
User.hasMany(Category, { foreignKey: "userId", as: "categories", onDelete: "CASCADE" });
Category.belongsTo(User, { foreignKey: "userId", as: "user" });

// Category -> Todo
Category.hasMany(Todo, { foreignKey: "categoryId", as: "todos", onDelete: "SET NULL" });
Todo.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// ChatRoom <-> User (through RoomMember)
ChatRoom.belongsToMany(User, { through: RoomMember, foreignKey: "roomId", as: "members" });
User.belongsToMany(ChatRoom, { through: RoomMember, foreignKey: "userId", as: "rooms" });

// ChatRoom -> ChatMessage
ChatRoom.hasMany(ChatMessage, { foreignKey: "roomId", as: "messages", onDelete: "CASCADE" });
ChatMessage.belongsTo(ChatRoom, { foreignKey: "roomId", as: "room" });

// User -> ChatMessage
User.hasMany(ChatMessage, { foreignKey: "userId", as: "messages", onDelete: "CASCADE" });
ChatMessage.belongsTo(User, { foreignKey: "userId", as: "sender" });

export { User, Todo, Category, ChatRoom, ChatMessage, RoomMember };
