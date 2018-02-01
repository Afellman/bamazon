// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');
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

// display all of the items available for sale
function printProducts() {
  connection.query('select * from products', function(err, res){
    products = res; 
    if (err) throw err;
    var table = new Table({
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
    questions() 
  });
};

//  ask them the ID of the product they would like to buy
function questions(){
  inquirer.prompt([
    {
      name: "buy_id",
      type: "input",
      message: "If you would like to buy a product please enter the product ID number here"
    },
    {
      name: "amount",
      type: "input",
      message: "How many would you like to buy?"
    }
  ]).then(function(answer){
    
    findItem(answer)

  })
};



// check if store has enough quantity
function findItem(answer){
  products.forEach(item => {
    if (item.item_id == answer.buy_id){
      processOrder(item, answer)
    }
  });
};

function processOrder(item, answer){
  console.log(JSON.stringify(item)  + " item")
  if (item.stock_quantity >= answer.amount){
    var newQuantity = item.stock_quantity - answer.amount
    connection.query('UPDATE products SET ? WHERE ?', [{stock_quantity: newQuantity}, {item_id: item.item_id}])
    console.log('Total Cost = ' + item.price * answer.amount)
  } else {
    console.log("Not Enough Quantity");
  }
};
 

module.exports = {
  printProducts
}