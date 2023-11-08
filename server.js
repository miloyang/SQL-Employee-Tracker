const inquirer = require('inquirer');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '4JSM#*51h&_EFbTM',
    database: 'employee_db'
},
    console.log(`Connected to the employee_db database.`)
);

afterConnection = () => {
    console.log("-----------------------------------------")
    console.log("|                                        |")
    console.log("|                                        |")
    console.log("|                                        |")
    console.log("|            Employee Manager            |")
    console.log("|                                        |")
    console.log("|                                        |")
    console.log("|                                        |")
    console.log("-----------------------------------------")
}

const promptUser = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'task',
            choices: ['View All Employee',
                'Add Employee',
                'Update Employee Role',
                'View All Roles',
                'Add Role',
                'View All Departments',
                'Add Department',
                'Quit']
        }
    ])
    .then((answers) => {
        const {choices} = answers;

        if (choices === "View All Employee") {
            showEmployees();
        }

        if (choices === "Add Employee") {
            addEmployee();
        }

        if (choices === "Update Employee Role") {
            updateEmployee();
        }

        if (choices === "View All Roles") {
            showRoles();
        }

        if (choices === "Add Role") {
            addRole();
        }

        if (choices === "View All Departments") {
            viewDepartments();
        }

        if (choices === "Add Department") {
            addDepartment();
        }

        if (choices === "Quit") {
            connection.end()
        };
    })
}
