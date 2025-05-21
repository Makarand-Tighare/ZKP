from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import hashlib
import random
import json
import time
import cv2
import base64
from cryptography.fernet import Fernet
from blockchain import Blockchain, AuthEvent

app = Flask(__name__)
CORS(app)

# Constants
p = 10007
g = 2
user_data_file = "user_data.json"
logs_file = "logs.txt"
encryption_key_file = "secret_key.key"
blockchain_file = "authentication_blockchain.json"
failed_attempts = {}
max_failed_attempts = 3

# Initialize blockchain
blockchain = Blockchain.load_from_file(blockchain_file)

# Generate and store encryption key
if not os.path.exists(encryption_key_file):
    encryption_key = Fernet.generate_key()
    with open(encryption_key_file, "wb") as key_file:
        key_file.write(encryption_key)
else:
    with open(encryption_key_file, "rb") as key_file:
        encryption_key = key_file.read()

cipher = Fernet(encryption_key)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def validate_username(username):
    """Validate that the username meets the requirements"""
    import re
    if not username or len(username) < 3:
        return False, "Username must be at least 3 characters"
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"
    return True, ""

def validate_password(password):
    """Validate that the password meets security requirements"""
    import re
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    return True, ""

def encrypt_secret_key(secret_key):
    return cipher.encrypt(str(secret_key).encode()).decode()

def decrypt_secret_key(encrypted_key):
    return int(cipher.decrypt(encrypted_key.encode()).decode())

def log_activity(username, action):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {username}: {action}"
    with open(logs_file, "a") as f:
        f.write(log_entry + "\n")
    return log_entry

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user')  # Default role is 'user'
    face_image = data.get('face_image')  # Base64 encoded image
    
    # Validate username and password
    is_valid_username, username_error = validate_username(username)
    if not is_valid_username:
        return jsonify({"status": "error", "message": username_error})
    
    is_valid_password, password_error = validate_password(password)
    if not is_valid_password:
        return jsonify({"status": "error", "message": password_error})
    
    # Check if user already exists
    user_data = {}
    if os.path.exists(user_data_file):
        with open(user_data_file, "r") as f:
            user_data = json.load(f)
            
    if username in user_data:
        return jsonify({"status": "error", "message": "User already exists"})
    
    # Validate role
    if role not in ['admin', 'staff', 'user']:
        role = 'user'  # Default to user if invalid role
    
    # Check if face image is provided for registration
    if not face_image and role != 'admin':  # Allow admin creation without face ID
        return jsonify({"status": "error", "message": "Face image is required for registration"})
    
    # Process registration
    hashed_password = hash_password(password)
    secret_key = random.randint(1, p - 2)
    encrypted_key = encrypt_secret_key(secret_key)
    
    # Save face image if provided
    face_id = None
    if face_image:
        try:
            face_id = f"{username}_face.png"
            image_data = base64.b64decode(face_image.split(',')[1] if ',' in face_image else face_image)
            with open(face_id, "wb") as f:
                f.write(image_data)
        except Exception as e:
            return jsonify({"status": "error", "message": f"Error processing face image: {str(e)}"})

    user_data[username] = {
        "password": hashed_password,
        "secret_key": encrypted_key,
        "role": role,
        "face_id": face_id
    }

    with open(user_data_file, "w") as f:
        json.dump(user_data, f, indent=4)
    
    log_activity(username, f"Registered with role: {role}")

    # Record registration event in blockchain
    registration_event = AuthEvent.create_event(
        AuthEvent.REGISTRATION,
        username,
        {
            "role": role,
            "used_facial_recognition": face_image is not None,
            "ip_address": request.remote_addr
        }
    )
    blockchain.add_block(registration_event)
    blockchain.save_to_file(blockchain_file)

    return jsonify({
        "status": "success",
        "message": "Registration successful",
        "secret_key": secret_key
    })

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    face_image = data.get('face_image')
    use_zkp_only = data.get('use_zkp_only', False)
    
    # Validate username
    is_valid_username, username_error = validate_username(username)
    if not is_valid_username:
        log_activity("system", f"Login attempt failed - Invalid username format: {username_error}")
        return jsonify({"status": "error", "message": username_error})
    
    # Password is optional if using ZKP-only authentication
    if not use_zkp_only and not password:
        log_activity("system", "Login attempt failed - No password provided for standard auth")
        return jsonify({"status": "error", "message": "Password is required for standard authentication"})
    
    if not os.path.exists(user_data_file):
        return jsonify({"status": "error", "message": "No users registered"})

    with open(user_data_file, "r") as f:
        user_data = json.load(f)

    if username not in user_data:
        log_activity(username, "Login failed - User not found")
        
        # Record failed login in blockchain
        login_failure_event = AuthEvent.create_event(
            AuthEvent.LOGIN_FAILURE,
            username,
            {
                "reason": "User not found",
                "ip_address": request.remote_addr
            }
        )
        blockchain.add_block(login_failure_event)
        blockchain.save_to_file(blockchain_file)
        
        return jsonify({"status": "error", "message": "User not found"})
    
    # Check for too many failed attempts
    if username in failed_attempts and failed_attempts[username] >= max_failed_attempts:
        log_activity(username, "Login blocked - Too many failed attempts")
        
        # Record blocked login in blockchain
        blocked_login_event = AuthEvent.create_event(
            AuthEvent.LOGIN_FAILURE,
            username,
            {
                "reason": "Account locked - Too many failed attempts",
                "ip_address": request.remote_addr
            }
        )
        blockchain.add_block(blocked_login_event)
        blockchain.save_to_file(blockchain_file)
        
        return jsonify({"status": "error", "message": "Account temporarily locked. Too many failed attempts."})
    
    # Password verification (skip if using ZKP-only auth)
    if not use_zkp_only and password:
        if hash_password(password) != user_data[username]["password"]:
            failed_attempts[username] = failed_attempts.get(username, 0) + 1
            log_activity(username, f"Login failed - Wrong password (Attempt {failed_attempts[username]})")
            
            # Record failed login in blockchain
            password_failure_event = AuthEvent.create_event(
                AuthEvent.LOGIN_FAILURE,
                username,
                {
                    "reason": "Invalid password",
                    "attempt_number": failed_attempts[username],
                    "ip_address": request.remote_addr
                }
            )
            blockchain.add_block(password_failure_event)
            blockchain.save_to_file(blockchain_file)
            
            return jsonify({"status": "error", "message": "Invalid username or password"})
    elif use_zkp_only:
        log_activity(username, "Using ZKP-only authentication (password check skipped)")
    
    # Face verification if configured
    if user_data[username].get("face_id") and face_image:
        try:
            # In a real system, you would do actual face comparison here
            # For this demo, we'll just verify that face image is provided
            
            # Record that face verification was attempted
            log_activity(username, "Face verification attempted")
            
            # This is a placeholder for actual face verification
            # verify_face_match(face_image, user_data[username]["face_id"])
            pass
        except Exception as e:
            log_activity(username, f"Face verification error: {str(e)}")
            # We're not failing the login if face verification has an error
            # but we do log it for security monitoring
    
    # Reset failed attempts on successful login
    if username in failed_attempts:
        failed_attempts.pop(username)
        
    encrypted_key = user_data[username]["secret_key"]
    secret_key = decrypt_secret_key(encrypted_key)
    role = user_data[username].get("role", "user")  # Default to 'user' if role is not set
    
    # Update user data to ensure it has a role
    if "role" not in user_data[username]:
        user_data[username]["role"] = "user"
        with open(user_data_file, "w") as f:
            json.dump(user_data, f, indent=4)
    
    auth_method = "ZKP-only" if use_zkp_only else "standard"
    log_activity(username, f"Login successful as {role} using {auth_method} authentication")
    
    # Record successful login in blockchain
    login_success_event = AuthEvent.create_event(
        AuthEvent.LOGIN_SUCCESS,
        username,
        {
            "role": role,
            "auth_method": auth_method,
            "used_facial_recognition": face_image is not None,
            "ip_address": request.remote_addr
        }
    )
    blockchain.add_block(login_success_event)
    blockchain.save_to_file(blockchain_file)
    
    return jsonify({
        "status": "success",
        "message": "Login successful",
        "secret_key": secret_key,
        "role": role,
        "auth_method": auth_method
    })

@app.route('/verify', methods=['POST'])
def verify():
    data = request.get_json()
    username = data.get('username')
    
    # Validate the secret key is provided
    if 'secret_key' not in data:
        log_message = "Verification failed - No secret key provided"
        if username:
            log_activity(username, log_message)
        else:
            log_activity("system", log_message)
        return jsonify({
            "status": "error",
            "message": "Secret key is required for verification",
            "verified": False
        })
    
    try:
        secret_key = int(data['secret_key'])
    except (ValueError, TypeError):
        log_message = "Verification failed - Invalid secret key format"
        if username:
            log_activity(username, log_message)
        else:
            log_activity("system", log_message)
        return jsonify({
            "status": "error",
            "message": "Invalid secret key format",
            "verified": False
        })
    
    # Calculate public key from secret key
    public_key = pow(g, secret_key, p)
    
    # Generate random value for commitment
    r = random.randint(1, p - 2)
    commitment = pow(g, r, p)
    
    # Generate random challenge
    challenge = random.randint(1, p - 2)
    
    # Calculate response
    response = (r + challenge * secret_key) % (p - 1)
    
    # Verify the proof
    left_side = pow(g, response, p)
    right_side = (commitment * pow(public_key, challenge, p)) % p
    verified = (left_side == right_side)
    
    if verified:
        log_message = "ZKP verification successful"
    else:
        log_message = "ZKP verification failed"
    
    if username:
        log_activity(username, log_message)
    
    # Record verification event in blockchain
    verification_event = AuthEvent.create_event(
        AuthEvent.ZKP_VERIFICATION,
        username or "unknown",
        {
            "verified": verified,
            "ip_address": request.remote_addr
        }
    )
    blockchain.add_block(verification_event)
    blockchain.save_to_file(blockchain_file)
    
    # Return the result and proof details for visualization
    return jsonify({
        "status": "success" if verified else "error",
        "message": "Verification successful" if verified else "Verification failed",
        "verified": verified,
        "proof_details": {
            "public_key": public_key,
            "commitment": commitment,
            "challenge": challenge,
            "response": response
        }
    })

@app.route('/users', methods=['GET'])
def list_users():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    
    # In a real system, you would validate the token properly
    # This is a simplified check
    
    if not os.path.exists(user_data_file):
        return jsonify({"status": "error", "message": "No users registered"})
        
    with open(user_data_file, "r") as f:
        user_data = json.load(f)
    
    # Remove sensitive information
    users_list = {}
    for username, data in user_data.items():
        users_list[username] = {
            "role": data.get("role", "user"),  # Default to 'user' if role is not present
            "has_face_id": data.get("face_id") is not None
        }
    
    return jsonify({
        "status": "success",
        "users": users_list
    })

@app.route('/logs', methods=['GET'])
def get_logs():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    
    # In a real system, you would validate the token and check admin role
    
    username = request.args.get('username')
    
    if not os.path.exists(logs_file):
        return jsonify({"status": "success", "logs": []})
    
    with open(logs_file, "r") as f:
        logs = f.readlines()
    
    if username:
        # Filter logs for specific user
        logs = [log for log in logs if f"] {username}:" in log]
    
    return jsonify({
        "status": "success",
        "logs": logs
    })

@app.route('/blockchain', methods=['GET'])
def get_blockchain():
    """Get blockchain records with optional filtering"""
    username_filter = request.args.get('username')
    event_type = request.args.get('event_type')
    page = int(request.args.get('page', 1))
    items_per_page = int(request.args.get('items_per_page', 10))
    
    # Load the blockchain
    blockchain_data = blockchain.chain
    
    # Apply filters if provided
    filtered_data = blockchain_data
    
    # Filter by username if provided
    if username_filter:
        filtered_data = [block for block in filtered_data 
                         if isinstance(block.data, dict) and 
                         block.data.get('username') == username_filter]
    
    # Filter by event type if provided
    if event_type:
        filtered_data = [block for block in filtered_data 
                         if isinstance(block.data, dict) and 
                         block.data.get('type') == event_type]
    
    # Calculate total blocks and pages
    total_blocks = len(filtered_data)
    total_pages = (total_blocks + items_per_page - 1) // items_per_page
    
    # Apply pagination
    start_index = (page - 1) * items_per_page
    end_index = min(start_index + items_per_page, total_blocks)
    paginated_data = filtered_data[start_index:end_index]
    
    # Convert blocks to dictionaries
    blocks = [block.to_dict() for block in paginated_data]
    
    # Check blockchain integrity
    is_valid = blockchain.is_chain_valid()
    
    return jsonify({
        "status": "success",
        "blockchain_valid": is_valid,
        "total_blocks": total_blocks,
        "total_pages": total_pages,
        "current_page": page,
        "blocks": blocks,
        "events": list(AuthEvent.__dict__.keys())
    })

@app.route('/update_role', methods=['POST'])
def update_role():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    
    # In a real system, you would validate the token and check admin role
    
    data = request.get_json()
    admin_username = data.get('admin_username')
    target_username = data.get('target_username')
    new_role = data.get('new_role')
    
    if not all([admin_username, target_username, new_role]):
        return jsonify({"status": "error", "message": "Missing required fields"})
    
    if new_role not in ['admin', 'staff', 'user']:
        return jsonify({"status": "error", "message": "Invalid role specified"})
    
    if not os.path.exists(user_data_file):
        return jsonify({"status": "error", "message": "No users registered"})
        
    with open(user_data_file, "r") as f:
        user_data = json.load(f)
    
    if target_username not in user_data:
        return jsonify({"status": "error", "message": "Target user not found"})
    
    user_data[target_username]["role"] = new_role
    
    with open(user_data_file, "w") as f:
        json.dump(user_data, f, indent=4)
    
    log_activity(admin_username, f"Changed role of {target_username} to {new_role}")
    
    # Add blockchain event for role change
    role_change_event = AuthEvent.create_event(
        AuthEvent.ROLE_CHANGE,
        admin_username,
        {
            "target_user": target_username,
            "old_role": user_data[target_username]["role"],
            "new_role": new_role,
            "ip_address": request.remote_addr
        }
    )
    blockchain.add_block(role_change_event)
    blockchain.save_to_file(blockchain_file)
    
    return jsonify({
        "status": "success",
        "message": f"Role updated successfully for {target_username}"
    })

if __name__ == '__main__':
    # Create log file if it doesn't exist
    if not os.path.exists(logs_file):
        with open(logs_file, "w") as f:
            f.write("# ZKP Backend Activity Logs\n")
    
    app.run(debug=True, port=5000)