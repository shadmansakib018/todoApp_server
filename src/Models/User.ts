import mongoose from 'mongoose';

const user = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
  	type : String,
  	required : true
  },
  todos: [{ todo: String, date: Date }]
});

export default mongoose.model("User", user);