import mongoose from "mongoose";

// Configure mongoose defaults
mongoose.set("strictQuery", true);

export { mongoose };
export default mongoose;
