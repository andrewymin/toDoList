import express from 'express';
import bodyParser from 'body-parser';
import {fileURLToPath} from 'url';
import path from 'path';
// import {getDate, getDay} from './date.js';
import mongoose from 'mongoose';
import _ from "lodash";
import dotenv from 'dotenv';
dotenv.config();
// import jQuery from "jquery";
// window.$ = window.jQuery = jQuery;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
let port = process.env.PORT;
let atlasPass = process.env.ATLASPASS;

// function capitalizeFirstLetter(string) {
//   return string.charAt(0).toUpperCase() + string.slice(1);
// }
// after npm i ejs, setting app to be able to use ejs
// also just like Flask static & templates folder, ejs uses: views
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static("public"));

// **********Localhost connection
// await mongoose.connect('mongodb://localhost:27017/toDoListDB');
await mongoose.connect(`mongodb+srv://testadmin:ericandybyung@cluster0.hcpgfev.mongodb.net/toDoListDB`);

const itemsSchema = new mongoose.Schema({
  name: {type: String, required: [true, "Must add to do item!"]}
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item ({
  name: 'Make coffee'
});
const item2 = new Item ({
  name: 'Eat food'
});
const item3 = new Item ({
  name: 'Drink lots of water'
});

const defaultItems = [item1, item2, item3];

// The schema below is created to find all other tables and their items from the
// itemsSchema relationship/embedding
const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

// Need a favicon url since browsers will by default try to request /favicon.ico
// Which in this case would create a new List with favicon
app.get('/favicon.ico', (req, res) => {res.status(204)});

app.get('/', (req, res) => {

  Item.find({}, (err, items)=>{

    if (items.length === 0) {
      Item.insertMany(defaultItems, (err)=>{
        (err) ? console.log(err): console.log("Successfully added default items.")});
        items = defaultItems;
      }

      res.render('list', {listTitle: "Today", listItems: items});
    });
  // let currentDay = getDate();
});


// link parameters for creating other tables using the root url
app.get("/:customListName", (req, res)=>{
  // req.params.customListName retrieves the word typed in after the "/" in the
  // root url
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList)=>{
    if (!err){

      if (!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect('/'+ customListName);

      } else {
        res.render('list', {listTitle: foundList.name, listItems: foundList.items});
      }
    }
  });
});

// post request of trying to add new task/item to db
app.post('/', (req, res)=>{

  let itemName = req.body.ni;
  const listName = req.body.button;
  // console.log(itemName)
  if (!itemName) {
    console.log('task was empty')
    return
  }
  const item = new Item({
    name: itemName,
  });

  if (listName === "Today"){
    item.save();
    res.redirect('/')
  } else {
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }

  // With the parameter defined as listTitle: "Work List",
  // Button value=<%= listTitle %>, the value of list is "Work"
  // Button value="<%= listTitle %>", the value of list is "Work List"
  // console.log(req.body)
  // if (req.body.button === 'Work List') {
  //   workItems.push(new_item);
  //   res.redirect('/work')
  // } else {
  //   items.push(new_item);
  //   res.redirect("/")
  // }
  // res.redirect('work')
});

app.post('/delete', (req, res)=>{
  // console.log(req.body.checkbox)
  const itemId =  req.body.checkbox;
  const listName = req.body.listName;

  // List.findById(itemId, (err, foundItem)=>{
  //   (err) ? console.log(err) : console.log(foundItem);
  // })

  if (listName === "Today"){
    Item.findByIdAndRemove({_id: itemId}, (err)=>{
      (err) ? console.log(err): res.redirect('/')
    })
  } else {
    // List.findOne({name: listName}, (err, foundList)=>{
    //   const indexOfItem = foundList.items.findIndex(object =>{
    //     return object._id == itemId;
    //   });
    //   foundList.items.splice(indexOfItem, 1);
    //   foundList.save();
    //   res.redirect('/' + listName);
    // });
// {

// <ModelName>.findOneAndUpdate({conditions}, {update}, callback)
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, (err, foundList)=>{
      (err) ? console.log(err): res.redirect('/' + listName);
    });
  }
});

// foundList.items.forEach(task=>{
//   if (task._id == itemId) {
//
//   }
// });
// console.log(foundList.items[4]._id)

if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Server has started`);
});
