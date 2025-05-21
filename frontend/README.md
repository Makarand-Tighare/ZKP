# Zero-Knowledge Proof Authentication Frontend

This is a modern React frontend for a Zero-Knowledge Proof (ZKP) authentication system.

## Features

- User registration and login
- Zero-Knowledge Proof verification
- Display of proof details (Public Key, Commitment, Challenge, Response)
- Verification result indicator

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add Tailwind CSS and Axios dependencies:
```bash
npm install -D tailwindcss postcss autoprefixer
npm install axios
```

3. Start the development server:
```bash
npm run dev
```

## Usage

1. Make sure the backend server is running on port 5000
2. Register a new user or login with an existing account
3. Click "Run Proof" to execute the Zero-Knowledge Proof verification
4. View the proof details and verification result

## Technologies Used

- React (Vite)
- Tailwind CSS
- Axios for API requests
