import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const socketHandler = async (socket) => {
  const admin = await User.findOne({ isAdmin: true });
  const adminId = admin._id.toString();
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  console.log(socket.handshake.auth.token);
  socket.join(socket.handshake.auth.token);
  socket.on("join room", (msg) => {
    socket.join(msg.roomId);
    console.log(`Room ${msg.roomId} joined`);
  });

  socket.on("message from admin", async (msg) => {
    msg.timeSent = new Date();
    msg.postedBy = adminId;
    const message = await (
      await Message.create(msg)
    ).populate("postedBy", "username avatar");
    socket.in(msg.roomId).emit("message from admin", message);
  });
  socket.on("message to admin", async (msg) => {
    msg.timeSent = new Date();
    msg.postedBy = msg.roomId;
    const message = await (
      await Message.create(msg)
    ).populate("postedBy", "username avatar");
    socket.in(adminId).emit("new message", msg);
    socket.in(msg.roomId).emit("message to admin", message);
  });
};

export default socketHandler;
