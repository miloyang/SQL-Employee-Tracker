INSERT INTO department (name)
VALUES ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("Sales");

INSERT INTO role (title, department_id, salary)
VALUES ("Sales Lead", 4, 100000),
       ("Salesperson", 4, 80000),
       ("Lead Engineer", 1, 150000),
       ("Software Engineer", 1, 120000),
       ("Account Manager", 2, 160000),
       ("Accountant", 2, 125000),
       ("Legal Team Lead", 3, 250000),
       ("Lawyer", 3, 190000);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Smith", 1, null),
       ("Michael", "Johnson", 2, 1),
       ("Ashley", "Rodriguez", 3, null),
       ("Kevin", "Tupik", 4, 3),
       ("Kunal", "Singh", 5, null),
       ("Malia", "Brown", 6, 5),
       ("Sarah", "Lourd", 7, null),
       ("Tom", "Allen", 8, 7);
