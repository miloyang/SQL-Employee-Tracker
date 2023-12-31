const { connect } = require('http2');
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

connection.connect(err => {
    if (err) throw err;
    afterConnection();
})

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
    promptUser();
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
            const { task } = answers;

            if (task === "View All Employee") {
                showEmployees();
            }

            else if (task === "Add Employee") {
                addEmployee();
            }

            else if (task === "Update Employee Role") {
                updateEmployee();
            }

            else if (task === "View All Roles") {
                showRoles();
            }

            else if (task === "Add Role") {
                addRole();
            }

            else if (task === "View All Departments") {
                showDepartments();
            }

            else if (task === "Add Department") {
                addDepartment();
            }

            else {
                connection.end()
            };
        });
};

const showEmployees = () => {
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

    connection.promise().query(sql)
        .then(([rows, fields]) => {
            console.table(rows);
            promptUser();
        })
        .catch((err) => {
            console.error('Error executing query', err);
            promptUser();
        });
};

const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'What is the first name of the employee you wish to add?',
            validate: (value) => { if (value) { return true } else { return 'Please enter a first name' } }
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'What is the last name of the employee you wish to add?',
            validate: (value) => { if (value) { return true } else { return 'Please enter a last name' } }
        }
    ])
        .then(answer => {
            const params = [answer.firstName, answer.lastName]

            const roleSql = `SELECT role.id, role.title FROM role`;

            connection.promise().query(roleSql)
                .then(([data, fields]) => {
                    const roles = data.map(({ id, title }) => ({ name: title, value: id }));

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

                            connection.promise().query(managerSql)
                                .then(([data, fields]) => {
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

                                            connection.promise().query(sql, params)
                                                .then(() => {
                                                    console.log('New employee has been added!')
                                                    showEmployees();
                                                })
                                                .catch(err => {
                                                    console.error('Error executing query', err);
                                                    showEmployees();
                                                });
                                        });
                                })
                                .catch(err => {
                                    console.error('Error executing query', err);
                                    showEmployees();
                                });
                        })
                        .catch(err => {
                            console.error('Error executing query', err);
                            showEmployees();
                        });
                })
                .catch(err => {
                    console.error('Error executing query', err);
                    showEmployees();
                });
        });
};

// function to update an employee
const updateEmployee = () => {
    // get employees from employee table
    const employeeSql = `SELECT * FROM employee`;

    connection.promise().query(employeeSql)
        .then(([data, fields]) => {
            const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'name',
                    message: "Which employee would you like to update?",
                    choices: employees
                }
            ])
                .then(employeeChoice => {
                    const employee = employeeChoice.name;
                    const params = [];
                    params.push(employee);

                    const roleSql = `SELECT * FROM role`;

                    connection.promise().query(roleSql)
                        .then(([data, fields]) => {
                            const roles = data.map(({ id, title }) => ({ name: title, value: id }));

                            inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'role',
                                    message: "What is the employee's new role?",
                                    choices: roles
                                }
                            ])
                                .then(roleChoice => {
                                    const role = roleChoice.role;
                                    params.push(role);

                                    let employeeId = params[0];
                                    params[0] = role;
                                    params[1] = employeeId;

                                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                                    connection.promise().query(sql, params)
                                        .then(() => {
                                            console.log("Employee has been updated!");
                                            showEmployees();
                                        })
                                        .catch(err => {
                                            console.error('Error executing query: 1', err);
                                            showEmployees();
                                        });
                                })
                                .catch(err => {
                                    console.error('Error executing query: 2', err);
                                    showEmployees();
                                });
                        })
                        .catch(err => {
                            console.error('Error executing query: 3', err);
                            showEmployees();
                        });
                })
                .catch(err => {
                    console.error('Error executing query: 4', err);
                    showEmployees();
                });
        })
        .catch(err => {
            console.error('Error executing query: 5', err);
            showEmployees();
        });
};

// function to show all roles
const showRoles = () => {
    console.log('Showing all roles');

    const sql = `SELECT role.id, role.title, department.name AS department
                 FROM role
                 INNER JOIN department ON role.department_id = department.id`;

    connection.promise().query(sql)
        .then(([rows, fields]) => {
            console.table(rows);
            promptUser();
        })
        .catch((err) => {
            console.error('Error executing query', err);
            promptUser();
        });
};

// function to add a role
const addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: "What is the role you want to add?",
            validate: (value) => { if (value) { return true } else { return 'Please enter a new role to add' } }
        },
        {
            type: 'input',
            name: 'salary',
            message: "What is the salary of this role?",
            validate: (value) => { if (value) { return true } else { return 'Please enter a valid salary' } }
        }
    ])
        .then(answer => {
            const params = [answer.role, answer.salary];

            // grab dept from department table
            const roleSql = `SELECT name, id FROM department`;

            connection.promise().query(roleSql)
                .then(([data, fields]) => {
                    const dept = data.map(({ name, id }) => ({ name: name, value: id }));

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'dept',
                            message: "What department is this role in?",
                            choices: dept
                        }
                    ])
                        .then(deptChoice => {
                            const dept = deptChoice.dept;
                            params.push(dept);

                            const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;

                            connection.promise().query(sql, params)
                                .then(() => {
                                    console.log(`Added ${answer.role} to roles!`);
                                    showRoles();
                                })
                                .catch(err => {
                                    console.error('Error executing query', err);
                                    showRoles();
                                });
                        })
                        .catch(err => {
                            console.error('Error selecting department', err);
                            showRoles();
                        });
                })
                .catch(err => {
                    console.error('Error selecting department', err);
                    showRoles();
                });
        });
};

// function to show all departments
const showDepartments = () => {
    console.log('Showing all departments');
    const sql = `SELECT department.id AS id, department.name AS department FROM department`;

    connection.promise().query(sql)
        .then(([rows, fields]) => {
            console.table(rows);
            promptUser();
        })
        .catch((err) => {
            console.error('Error executing query:', err);
            promptUser();
        });
};

// function to add a department 
const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'addDept',
            message: "What department do you want to add?",
            validate: (value) => { if (value) { return true } else { return 'Please enter a valid department' } }
        }
    ])
        .then(answer => {
            const sql = `INSERT INTO department (name)
                    VALUES (?)`;
            connection.query(sql, answer.addDept, (err, result) => {
                if (err) throw err;
                console.log('Added ' + answer.addDept + " to departments!");

                showDepartments();
            });
        });
};

