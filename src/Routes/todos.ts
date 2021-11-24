import { Router } from 'express';
import User from '../Models/User';
import {isUserMiddleware} from "../index";

const router = Router();

router.post('/add',isUserMiddleware, async (req, res)=>{//takes new todo and username from req.body
  const todo:string = req.body.todo;
  
  if(!todo){
    console.log(todo);
    return res.send("no todos sent");
  }
  const todoobj = { todo:todo, date: Date.now() };
  const updateduser = await User.update({ username: req.body.username },{ $push: { todos: todoobj  } });
  return res.send(updateduser);

  });

router.post('/gettasks', isUserMiddleware, (req,res)=>{// get all the tasks of a user, takes only the username in req body
	User.findOne({username:req.body.username},{todos:1}).then(todos=>{
		return res.send(todos);
	}).catch(err => console.log(err));
});

router.post('/gettask', isUserMiddleware, async (req,res)=>{//get one task by todo and username
  const todo:string = req.body.todo;
  
  if(!todo){
    console.log(todo);
    return res.send("no todos sent");
  }try{
  const onetodo = await User.findOne( { username:req.body.username, todos: { $elemMatch: {todo:todo} } }, {"todos.$":1} )
  return res.send(onetodo);
console.log(onetodo)}
  catch(err){
    return res.send("error")
  }
    
});

router.post('/update', isUserMiddleware,  async (req, res)=>{// takes oldtodo and newtodo
  const newtodo:string = req.body.newtodo;
  const oldtodo:string = req.body.oldtodo;
  
  if(!newtodo || !oldtodo){
    return res.send("no todos sent");
  }try{
  const updateduser = await User.updateOne( { todos: { $elemMatch: {todo:oldtodo} } }, {$set:{"todos.$.todo": newtodo,"todos.$.date": Date.now()} });//, "todos.$.date": Date.now()
  return res.send(updateduser);
}
catch(err){
  console.log(err);
  return res.status(400).send("update error")
}

});

router.post('/delete', isUserMiddleware, async (req, res)=>{// takes the todo and username
  const todo:string = req.body.todo;
  
  if(!todo){
    return res.send("no todos sent");
  }
  const updateduser = await User.updateOne( {username:req.body.username}, {$pull:{todos : {todo:todo} }})
  return res.send(updateduser);
  });

module.exports = router;