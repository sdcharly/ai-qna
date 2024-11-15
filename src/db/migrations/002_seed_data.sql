-- Insert admin user
INSERT INTO users (id, email, password_hash, role)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@example.com',
    -- Password is 'admin123'
    '$2a$10$rQEk5gxEGJFX5.R1c0JXFOuEL1qRUQJHZEm0S1yR2iNpqWXLQF1Ky',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample quizzes
INSERT INTO quizzes (id, title, description, difficulty, topics, created_by, status)
VALUES
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'JavaScript Basics',
        'Test your knowledge of JavaScript fundamentals',
        'beginner',
        ARRAY['javascript', 'programming', 'web development'],
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'published'
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Advanced TypeScript',
        'Deep dive into TypeScript features',
        'advanced',
        ARRAY['typescript', 'programming', 'web development'],
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'published'
    )
ON CONFLICT (title) DO NOTHING;

-- Insert sample questions for JavaScript Basics
INSERT INTO questions (quiz_id, question, options, correct_answer, explanation, difficulty)
VALUES
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'What is the output of: console.log(typeof [])?',
        ARRAY['object', 'array', 'undefined', 'null'],
        'object',
        'In JavaScript, arrays are objects. The typeof operator returns "object" for arrays.',
        'beginner'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Which method removes the last element from an array?',
        ARRAY['pop()', 'push()', 'shift()', 'unshift()'],
        'pop()',
        'The pop() method removes the last element from an array and returns that element.',
        'beginner'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'What is the result of: 2 + "2"?',
        ARRAY['4', '"22"', '22', 'NaN'],
        '"22"',
        'When adding a number and a string, JavaScript converts the number to a string and performs string concatenation.',
        'beginner'
    )
ON CONFLICT (quiz_id, question) DO NOTHING;

-- Insert sample questions for Advanced TypeScript
INSERT INTO questions (quiz_id, question, options, correct_answer, explanation, difficulty)
VALUES
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'What is a TypeScript interface?',
        ARRAY[
            'A class definition',
            'A contract that defines the structure of an object',
            'A function declaration',
            'A type alias'
        ],
        'A contract that defines the structure of an object',
        'Interfaces in TypeScript define contracts in your code and provide explicit names for type checking.',
        'advanced'
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'What is the purpose of the "keyof" operator in TypeScript?',
        ARRAY[
            'To create a union type of allowed property names',
            'To create a new object type',
            'To check if a key exists in an object',
            'To create an intersection type'
        ],
        'To create a union type of allowed property names',
        'The keyof operator takes an object type and produces a string or numeric literal union of its keys.',
        'advanced'
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'What is a TypeScript generic?',
        ARRAY[
            'A special type of class',
            'A type that can work with multiple types',
            'A global variable',
            'A type of function'
        ],
        'A type that can work with multiple types',
        'Generics provide a way to make components work with any data type and not restrict to one data type.',
        'advanced'
    )
ON CONFLICT (quiz_id, question) DO NOTHING;
