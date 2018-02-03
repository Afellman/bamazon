// *** Add choose again function after view is showed *** .
// *** Add new item doesn't work... ?

// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');

let products;
// ------------------- Conencting to database ---------------------------
let connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

// error check for connection
connection.connect(function(err){
  if (err) throw err;
  // Calling function for inquirer to ask the questions
  askQuestions();
});
// --------------------------------------------------------

// ------------------- Inquirer ---------------------------
// Inquirer questions to choose which view to show
function askQuestions(){
  inquirer.prompt(
    {
      name: "choice",
      type: "list",
      message: "Please Choose a View",
      choices: ["Products", "Low Inventory", "Add to Inventory", "Add New Product", "Quit"]
    }
  ).then(function(answer){
    // Switch case deciding where to go based on the choice from inquirer
    switch (answer.choice){
      case "Products":
        printProducts();
        break
      case "Low Inventory":
        printLowInventory();
        break
      case "Add to Inventory":
        addToInventory();
        break
      case "Add New Product":
        addNewProduct();
        break
      case "Quit":
        // process.exit();
      default:
        // If no selection is made or somehow inquirer bugs out, the questions 
        // will be asked again.
        console.log("That is not a proper selection")
        askQuestions()
        break
    }
  })
}
// -----------------------------------------------------------------------

// ------------------- Print Products Function ---------------------------

// Function to display all the products currently in the inventory.
function printProducts() {
  connection.query('select * from products', function(err, res){
    products = res; 
    if (err) throw err;
    let table = new Table({
      head: ['ID', 'Product Name', 'Price', 'Quantity' ], 
      colWidths: [5, 60, 30, 10, 10],
      chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔', 'top-right': '╗',   'bottom': '═' , 'bottom-mid': '╧' ,
      'bottom-left': '╚' , 'bottom-right': '╝',   'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
      , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
    });
    products.forEach(element => {
      table.push([
        element.item_id, 
        element.product_name,
        element.price,
        element.stock_quantity
      ]);
    });
    console.log(table.toString());
  });
};

// ----------------------------------------------------------------------

// ------------------- Low Inventory Function ---------------------------
// View Low Inventory
function printLowInventory() {
  connection.query('select * from products WHERE stock_quantity < 5', function(err, res){
    products = res; 
    if (err) throw err;
    let table = new Table({
      head: ['ID', 'Product Name', 'Department', 'Price', 'Quantity' ], 
      colWidths: [5, 60, 30, 10, 10],
      chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔', 'top-right': '╗',   'bottom': '═' , 'bottom-mid': '╧' ,
      'bottom-left': '╚' , 'bottom-right': '╝',   'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
      , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
    });
    products.forEach(element => {
      table.push([
        element.item_id, 
        element.product_name,
        element.department_name,
        element.price,
        element.stock_quantity
      ]);
    });
    console.log(table.toString());
  });
}
// --------------------------------------------------------------------------

// ------------------- Add New Inventory Function ---------------------------
// Add to Inventory
function addToInventory() {
  printProducts()
  inquirer.prompt([
    {
      name: "item",
      type: "input",
      message: "Please enter item ID you wish to add more of"
    },
    {
      name: 'amount',
      type: "input",
      message: "How many units would you like to add?"
    }
  ])
  .then(function (answer) {
      let new_quantity;
      let current_quantity;
      let amount_to_add = parseInt(answer.amount);
      current_quantity = parseInt(products[0].stock_quantity);
      new_quantity = current_quantity + amount_to_add;
      connection.query('UPDATE products SET ? WHERE ?', [
        {stock_quantity: new_quantity},
        {item_id: answer.item}
      ],function (err, res){
      });
    })
};
// ------------------------------------------------------------------------

// ------------------- Add New Product Function ---------------------------
// Add New Product
function addNewProduct() {
  inquirer.prompt([
    {
      name: "name",
      type: "input",
      message: "What is the product name?"
    },
    {
      name: 'department',
      type: "input",
      message: "What department does it belong in?"
    },
    {
      name: 'price',
      type: "input",
      message: "What is the price?"
    },
    {
      name: 'quantity',
      type: "input",
      message: "How many of them are you adding?"
    }
  ])
  .then(function (answer) {
    connection.query('INSERT INTO products SET ?', {
      product_name: answer.name,
      department_name: answer.department,
      price: answer.price,
      stock_quantity: answer.quantity
    },function (err, res){
      console.log("done")
    });
  })
}
// ------------------------------------------------------------------------