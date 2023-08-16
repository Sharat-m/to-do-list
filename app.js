const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); //step 1
const _= require("lodash");
const { name } = require("ejs");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

 
mongoose.connect("mongodb+srv://sharat-admin:4SF19me413%40@cluster0.smnfjxx.mongodb.net/todolistDB", { useNewUrlParser: true }); //step 2 :create a todolistDB database and connect it
//step 3: create schema
const itemsSchema = new mongoose.Schema({ 
name : String,
});

const Item  = mongoose.model("Item", itemsSchema); //step 4: create mongoose model
//step 5: create mongoose documents
 const item1 = new Item({ 
 name : "welcomne to do list"
 });
 const item2 = new Item({
  name : "Hit the + button to add a new item"
 });
 const item3 = new Item({
  name : "<-- hit this to delete"
 });
const defaultItems = [item1, item2, item3 ]; //step 6: items are stored in array

// step 13 :creasting new schema customlistname
 const ListsSchema = new mongoose.Schema({
name: String,
items: [itemsSchema]
 });
const Lists = mongoose.model("List", ListsSchema);
 //list schema is writen inside the customlist






 //step 7: mongoose insertMany()
//  Item.insertMany(defaultItems)
//  .then(function() {
//    console.log("Successfully inserted default items to database");
//  })
//  .catch((err) => {
//    console.error("Error inserting default items:", err);
//  });

//step 8: fetch the requierd value from the databse 
app.get("/", function (req, res) {
  // Find all items in the database
  Item.find({})
  .then(function(foundItems) {
      // Log the foundItems to the console
      //console.log(foundItems);
  if (foundItems.length === 0){  // step 7: mongoose insertMany()
 Item.insertMany(defaultItems)
 .then(function() {
   console.log("Successfully inserted default items to database");
 })
 .catch((err) => {
   console.error("Error inserting default items:", err);
 });
 res.redirect("/");
  } else {
      // Render the view and pass the foundItems to the view
      res.render("List", { listTitle: "Today", newListItems: foundItems });
  }
    })
    .catch(function(err) {
      console.error(err);
      // Handle the error appropriately, e.g., rendering an error view
      res.render("ErrorView", { errorMessage: "An error occurred while fetching items." });
    });
});

// step 11:express route parameters, getting the parameter in app.js whren url new url is enter

//  Lists.findOne({name :customListName})
//  .then((docs)=>{
//      console.log("Result :",docs.items[0]);
//  })
//  .catch((err)=>{
//      console.log(err);
//  });


  //create a new list using list model
   
  app.get("/:customListName", async function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
  //step 14: finding the route input
    try {
      const foundList = await Lists.findOne({ name: customListName }).exec();
      
      if (!foundList) {
        const list = new Lists({
          name: customListName,
          items: defaultItems
        });
        await list.save();
        res.redirect("/" +customListName);//this line s used to redirect
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    } catch (err) {
      console.error(err);
    }
  });
  




//step 9:adding new items to the database
app.post("/", async function(req, res){
  // const item = req.body.newItem;
  // if(req.body.list === "Work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }else {
  //   items.push(item);
  //   res.redirect("/");
  // }
  const itemName = req.body.newItem;
  //step 15: adding new items to the custom to do list
  const listName = req.body.list;

  const item = new Item({ 
    name : itemName,
    });

    try {
      if (listName === "Today") {
        await item.save();
        res.redirect("/");
      } else {
        const foundList = await Lists.findOne({ name: listName }).exec();
        foundList.items.push(item); // Push the  of the new item
        await foundList.save();
        res.redirect("/" + listName);
      }
    } catch (err) {
      console.error(err);
    }
  });


// step 10: deleting the checked box data
app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  // step16
  const listName = req.body.listName;

  try {
    if (listName === "Today") {
      await Item.findByIdAndRemove(checkedItemId);
      console.log("Deleted successfully");
      res.redirect("/");
    } else {
      await Lists.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.error(err);
  }
});


//about
app.get("/about", function (req, res) {
  res.render("about.ejs");
});




//start the server 3000
app.listen(3000, function () {
  console.log("server started on port 3000.");
});