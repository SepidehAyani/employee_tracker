const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table')

// DB Connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'user',
    password: 'password',
    database: 'employees_db'
})

// Check the connection
connection.connect(function (err) {
    if (err) throw err;
    options();
})

// List of options to choose
function options() {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'You have accessed employee database. Please choose from the following options.',
        choices: [
            'View all employees',
            'View all departments',
            'View all roles',
            'View employees by manager',
            'View employees by department',
            'View department budgets',
            'Add an employee',
            'Add a department',
            'Add a role',
            'Update employee manager',
            'Delete a department',
            'Delete a role',
            'Delete a employee',
            'EXIT'
        ]
    }).then(function (answer) {
        switch (answer.action) {
            case 'View all employees':
                viewEmployees();
                break;
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View employees by manager':
                viewEmployeesByManager();
                break;
            case 'View employees by department':
                viewEmployeesByDepartment();
                break;
            case 'View department budgets':
                viewDepartmentBudget();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Update employee manager':
                updateManager();
                break;
            case 'Delete a department':
                deleteDepartment();
                break;
            case 'Delete a role':
                deleteRole();
                break;
            case 'Delete a employee':
                deleteEmployee();
                break;
            case 'EXIT':
                exitApp();
                break;
            default:
                break;
        }
    })
};

// Employees in the DB
function viewEmployees() {
    var query = 'SELECT * FROM employee';
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(res.length + ' employees found!');
        console.table('All Employees:', res);
        options();
    })
};

// Departments in the DB
function viewDepartments() {
    var query = 'SELECT * FROM department';
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table('All Departments:', res);
        options();
    })
};

// Roles in the DB
function viewRoles() {
    var query = 'SELECT * FROM role';
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table('All Roles:', res);
        options();
    })
};

// BONUS: View employees by manager
function viewEmployeesByManager() {
    const sql = `SELECT employee.first_name, 
                    employee.last_name, 
                    employee.manager_id AS manager
                    FROM employee 
                    LEFT JOIN role ON employee.manager_id = role.id 
                    LEFT JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.log('Employees by Manager:');
        console.table(response);
        options();
    });
};

// BONUS: View employees by department
function viewEmployeesByDepartment() {
    const sql = `SELECT employee.first_name, 
                    employee.last_name, 
                    department.name AS department
                    FROM employee 
                    LEFT JOIN role ON employee.role_id = role.id 
                    LEFT JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.log('Employees by Department:');
        console.table(response);
        options();
    });
};

// BONUS: View budget By Department
function viewDepartmentBudget() {
    console.log('Budget By Department:');
    const sql = `SELECT department.id AS id, 
                    department.name AS name,
                    SUM(salary) AS budget
                    FROM  role  
                    INNER JOIN department ON role.id = department.id GROUP BY role.id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        options();
    });
};

// Add an employee to the DB
function addEmployee() {
    connection.query('SELECT * FROM role', function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: 'first_name',
                type: 'input',
                message: "What is the employee's fist name? ",
            },
            {
                name: 'last_name',
                type: 'input',
                message: "What is the employee's last name? "
            },
            {
                name: 'manager_id',
                type: 'input',
                message: "What is the employee's manager's ID? "
            },
            {
                name: 'role',
                type: 'list',
                choices: function () {
                    var roleArray = [];
                    for (let i = 0; i < res.length; i++) {
                        roleArray.push(res[i].title);
                    }
                    return roleArray;
                },
                message: "What is this employee's role? "
            }
        ]).then(function (answer) {
            let role_id;
            for (let a = 0; a < res.length; a++) {
                if (res[a].title == answer.role) {
                    role_id = res[a].id;
                    console.log(role_id)
                }
            }
            connection.query(
                'INSERT INTO employee SET ?',
                {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    manager_id: answer.manager_id,
                    role_id: role_id,
                },
                function (err) {
                    if (err) throw err;
                    console.log('Your employee has been added!');
                    viewEmployees();
                })
        })
    })
};

// Add a department to the DB
function addDepartment() {
    inquirer.prompt([
        {
            name: 'newDepartment',
            type: 'input',
            message: 'Which department would you like to add?'
        }
    ]).then(function (answer) {
        connection.query(
            'INSERT INTO department SET ?',
            {
                name: answer.newDepartment
            });
        var query = 'SELECT * FROM department';
        connection.query(query, function (err, res) {
            if (err) throw err;
            console.log('Your department has been added!');
            console.table('All Departments:', res);
            viewDepartments();
        })
    })
};

// Add a role to the DB
function addRole() {
    connection.query('SELECT * FROM department', function (err, res) {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'new_role',
                type: 'input',
                message: "What new role would you like to add?"
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary of this role? (Enter a number)'
            },
            {
                name: 'Department',
                type: 'list',
                choices: function () {
                    var deptArry = [];
                    for (let i = 0; i < res.length; i++) {
                        deptArry.push(res[i].name);
                    }
                    return deptArry;
                },
            }
        ]).then(function (answer) {
            let department_id;
            for (let a = 0; a < res.length; a++) {
                if (res[a].name == answer.Department) {
                    department_id = res[a].id;
                }
            }
            connection.query(
                'INSERT INTO role SET ?',
                {
                    title: answer.new_role,
                    salary: answer.salary,
                    department_id: department_id
                },
                function (err, res) {
                    if (err) throw err;
                    console.log('Your new role has been added!');
                    console.table('All Roles:', res);
                    viewRoles();
                })
        })
    })
};

// BONUS: Update employee manager
function updateManager() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the employee's ID you want to be updated",
            name: "updateManager"
        },
        {
            type: "input",
            message: "Enter the new Manager ID for that employee",
            name: "newManager"
        }
    ]).then(function (res) {
        const updateManager = res.updateManager;
        const newManager = res.newManager;
        const queryUpdate = `UPDATE employee SET manager_id = "${newManager}" WHERE id = "${updateManager}"`;
        connection.query(queryUpdate, function (err, res) {
            if (err) {
                throw err;
            }
            console.table(res);
            viewEmployees();
        })
    });
}

// BONUS: Delete a department in the DB
async function deleteDepartment() {
    const answer = await inquirer.prompt([
        {
            name: "first",
            type: "input",
            message: "Enter the department name you want to remove:  "
        }
    ]);

    connection.query('DELETE FROM department WHERE ?',
        {
            name: answer.first
        },
        function (err) {
            if (err) throw err;
        }
    )
    console.log('Department has been removed on the system!');
    viewDepartments();
};

// BONUS: Delete a role in the DB
async function deleteRole() {
    const answer = await inquirer.prompt([
        {
            name: "first",
            type: "input",
            message: "Enter the role ID you want to remove:  "
        }
    ]);

    connection.query('DELETE FROM role WHERE ?',
        {
            id: answer.first
        },
        function (err) {
            if (err) throw err;
        }
    )
    console.log('Role has been removed on the system!');
    viewRoles();
};

// BONUS: Delete an employee in the DB
async function deleteEmployee() {
    const answer = await inquirer.prompt([
        {
            name: "first",
            type: "input",
            message: "Enter the employee ID you want to remove:  "
        }
    ]);

    connection.query('DELETE FROM employee WHERE ?',
        {
            id: answer.first
        },
        function (err) {
            if (err) throw err;
        }
    )
    console.log('Employee has been removed on the system!');
    viewEmployees();
};

// Exit the app
function exitApp() {
    connection.end();
};