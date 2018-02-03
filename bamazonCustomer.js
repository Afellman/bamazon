// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');
// Global variable
let products;

// create connection to the database
var connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

// error check for connection
connection.connect(function(err){
  if (err) throw err;
  printProducts();
});

// ------------------- printProducts() --------------------------

// display all of the items available for sale.
function printProducts() {
  // Gathering everything from the products table.
  connection.query('select * from products', function(err, res){
    products = res; 
    if (err) throw err;
    // Building a table to store the results using node package "cli-table".
    var table = new Table({
      head: ['ID', 'Product Name', 'Department', 'Price', 'Quantity' ], 
      colWidths: [5, 60, 30, 10, 10],
      chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔', 'top-right': '╗',   'bottom': '═' , 'bottom-mid': '╧' ,
      'bottom-left': '╚' , 'bottom-right': '╝',   'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
      , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
    });
    // Pushing all the results to the table
    products.forEach(element => {
      table.push([
        element.item_id, 
        element.product_name,
        element.department_name,
        element.price,
        element.stock_quantity
      ]);
    });
    // Showing the table to the CLI.
    console.log(table.toString());
    // Calling the next function.
    questions() 
  });
};
// ------------------------------------------------------------

// ------------------- questions() --------------------------

function questions(){
  //  ask the user the ID and quantity of the product they would like to buy.
  inquirer.prompt([
    {
      name: "buy_id",
      type: "input",
      message: "Please Enter the ID Of The Product You Would Like To Purchase \n[type 'q' to quit]"
    },
    {
      name: "amount",
      type: "input",
      message: "How many would you like to buy?"
    }
  ]).then(function(answer){
    if(answer.buy_id == "q") {
      process.exit();
    } else {
      // Calling the next function.
      processOrder(answer)
    }
  })
};

// ------------------- processOrder() --------------------------

function processOrder(answer){
  // First time using a filter (super cool!)
  // The filter runs through all the rows from mysql looking for the matching
  // ID and stores the result in item1. 
  let item1 = products.filter(element => element.item_id == answer.buy_id);
  // Item1 is an array so we need to select just the element itself.
  let item = item1[0]
  // Checking if there is enough quantity of that item.
  if (item.stock_quantity >= answer.amount){
    // Reducing the quantity and adding up the total cost.
    var newQuantity = item.stock_quantity - answer.amount
    var total_cost = item.price * answer.amount;
    // Pushing the new quantity and total cost to mysql.
    connection.query('UPDATE products SET ? WHERE ?', [{stock_quantity: newQuantity, product_sales: total_cost}, {item_id: item.item_id}])
    console.log('Total Cost = ' + total_cost)
    console.log("Thank You For Shopping at Bamazon. Have a Great Day")
    process.exit()
  } else {
    console.log("Not Enough Quantity");
    printProducts()
  }
};
