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
      choices: ["View Product Sales by Department", "Create New Department"]
    }
  ).then(function(answer){
    // Switch case deciding where to go based on the choice from inquirer
    switch (answer.choice){
      case "View Product Sales by Department":
        productSales();
        break
      case "Create New Department":
        newDepartment();
        break
      default:
        // If no selection is made or somehow inquirer bugs out, the questions 
        // will be asked again.
        console.log("That is not a proper selection")
        askQuestions()
        break
    }
  })
}


function productSales() {
  connection.query("SELECT * FROM departments", function (err, res) {
    console.log(res)
  });
};

function newDepartment(){

}