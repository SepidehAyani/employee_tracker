USE employees_db;

INSERT INTO department (name)
VALUES 
('Human Resources'),
('Engineering'),
('Security'),
('Finance'),
('Legal'),
('Sales');

INSERT INTO role (title, salary, department_id)
VALUES
('Manager', 12000, 1),
('Engineer', 120000, 2),
('Security Consultant', 55000, 3),
('Accountant', 70000, 4),
('Marketing Expert', 50000, 5),
('Lawyer', 80000, 6);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Andie', 'Henning', 1, 123),
('Azi', 'DeLuca', 2, 200),
('Martha', 'Louis', 3, 355),
('Sara', 'Mendoza', 4, 100),
('Nate', 'Bell', 5, 999),
('Tim', 'Smith', 6, 677);