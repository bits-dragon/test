import mongoose from 'mongoose';

const uri = 'mongodb+srv://bl:dbpassword@cluster0.srbit0j.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';
await mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
//---------------------------------------------------------------------------

const tokenli = new mongoose.Schema({
    botname: String,
    token: String,
    channelId: String
})
const Tokenlist = mongoose.model("tokens", tokenli);
// await new Tokenlist({
//     botname: "MyjobBot",
//     token: "xoxb-8840923140053-9365248833524-R7QndmyA7i1reUCj8un3cEj9",
//     channelId: "C09AFMB5MV1"
// }).save()
let tokens = await Tokenlist.find();
console.log(tokens)