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
    });
};

showEmployees = () => {
    console.log('Showing all employees');
    const sql = `SELECT employee.id,
    employee.first_name,
    employee.last_name,
    role.title,
    department.name AS department,
    role.salary,
    CONCAT (manager.first_name, " ", manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    connection.promise().query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        promptUser();
    });
};

addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'What is the first name of the employee you wish to add?',
            validate: (value) => { if (value) {return true } else { return 'Please enter a first name'}}
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'What is the last name of the employee you wish to add?',
            validate: (value) => { if (value) {return true } else { return 'Please enter a last name'}}
        }
    ])
    .then(answer => {
        const params = [answer.firstName, answer.lastName]

        const roleSql = `SELECT role.id, role.title FROM role`;

        connection.promise().query(roleSql, (err, data) => {
            if (err) throw err;

            const roles = data.map(({id, title}) => ({ name: title, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the role of the employee you are adding?',
                    choices: roles
                }
            ])
            .then(roleChoice => {
                const role = roleChoice.role;
                params.push(role);

                const managerSql = `SELECT * FROM employee`;

                connection.promise().query(managerSql, (err, data) => {
                    if (err) throw err;

                    const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: 'Who is the manager of the employee you are adding?',
                            choices: managers
                        }
                    ])
                    .then(managerChoice => {
                        const manager = managerChoice.manager;
                        params.push(manager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, ?, ?)`;

                        connection.query(sql, params, (err, result) => {
                            if (err) throw err;
                            console.log('New employee has been added!')

                            showEmployees();
                        });
                    });
                });
            })
        })
    })
}
