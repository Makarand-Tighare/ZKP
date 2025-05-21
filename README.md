# Zero-Knowledge Proof Authentication System

A secure authentication system that combines Zero-Knowledge Proofs (ZKP), facial recognition, and blockchain for audit trails.

## Project Structure

- **Backend**: Flask-based Python server implementing ZKP, facial recognition, and blockchain
- **Frontend**: React application with Vite for user interface

## Features

- Zero-Knowledge Proof based authentication
- Facial recognition for additional security
- Blockchain ledger for recording authentication events
- Different user roles (admin, staff, user)
- Modern React frontend with ZKP visualization

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
python zkp_backend.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

## Technologies Used

- Python (Flask)
- React with Vite
- Tailwind CSS
- Zero-Knowledge Proofs
- OpenCV for facial recognition
- Blockchain for secure event logging 