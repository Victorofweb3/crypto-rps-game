# Step 1: Import the tools we need
# 'hashlib' is the toolbox for creating our "digital locked boxes" (hashes).
# 'os' helps us create a good, random secret password.
# 'getpass' will hide the player's move as they type it, like a password field.
import hashlib
import os
import getpass

# Step 2: A function to create our commitment (the locked box)
def generate_commitment(move, secret):
    """Takes a move and a secret, and returns the hash commitment."""
    combined_string = move + secret
    # We must .encode() the string to turn it into bytes before hashing
    return hashlib.sha256(combined_string.encode()).hexdigest()

# Step 3: A function to decide who wins
def determine_winner(move_A, move_B):
    """Determines the winner based on the rules of Rock, Paper, Scissors."""
    if move_A == move_B:
        return "It's a Tie!"
    
    winning_moves = {
        "rock": "scissors",
        "scissors": "paper",
        "paper": "rock"
    }

    if winning_moves.get(move_A) == move_B:
        return "Player A wins!"
    else:
        return "Player B wins!"

# Step 4: The main game flow
def play_game():
    """The main function that runs the game for two players on one computer."""
    print("--- Welcome to Verifiable Rock, Paper, Scissors! ---")
    print("The game will happen in two phases: Commit and Reveal.\n")

    # --- PLAYER A's TURN (COMMIT) ---
    print("--- Player A's Turn (Look away, Player B!) ---")
    # getpass hides the input as it's typed
    move_A = getpass.getpass("Player A, enter your move (rock, paper, or scissors): ").lower()
    
    # Check if the move is valid
    while move_A not in ["rock", "paper", "scissors"]:
        print("Invalid move! Please try again.")
        move_A = getpass.getpass("Player A, enter your move (rock, paper, or scissors): ").lower()
        
    secret_A = os.urandom(16).hex() # Generates a random 16-byte secret password
    commitment_A = generate_commitment(move_A, secret_A)
    
    print("\nPlayer A, your commitment has been generated.")
    print("This is your 'locked box'. Copy it and send it to Player B.")
    print(f"Your Commitment: {commitment_A}\n")
    print("--------------------------------------------------\n")

    # --- PLAYER B's TURN (COMMIT) ---
    print("--- Player B's Turn (Look away, Player A!) ---")
    move_B = getpass.getpass("Player B, enter your move (rock, paper, or scissors): ").lower()

    while move_B not in ["rock", "paper", "scissors"]:
        print("Invalid move! Please try again.")
        move_B = getpass.getpass("Player B, enter your move (rock, paper, or scissors): ").lower()

    secret_B = os.urandom(16).hex()
    commitment_B = generate_commitment(move_B, secret_B)

    print("\nPlayer B, your commitment has been generated.")
    print("This is your 'locked box'. Copy it and send it to Player A.")
    print(f"Your Commitment: {commitment_B}\n")
    print("--------------------------------------------------\n")

    # --- REVEAL PHASE ---
    print("--- Reveal Phase ---")
    print("Both players have exchanged commitments. Time to reveal!")

    # Player A reveals their info to Player B (who would run this part)
    # And Player B reveals their info to Player A.
    # For this program, we just enter the other player's info.

    revealed_move_A = input("Enter Player A's revealed move: ").lower()
    revealed_secret_A = input("Enter Player A's revealed secret: ")
    
    revealed_move_B = input("Enter Player B's revealed move: ").lower()
    revealed_secret_B = input("Enter Player B's revealed secret: ")

    # --- VERIFICATION ---
    print("\n--- Verifying Proofs ---")

    # Verify Player A's commitment
    is_A_valid = generate_commitment(revealed_move_A, revealed_secret_A) == commitment_A
    # Verify Player B's commitment
    is_B_valid = generate_commitment(revealed_move_B, revealed_secret_B) == commitment_B

    if is_A_valid and is_B_valid:
        print("✅ Both players are honest! Commitments are verified.")
        print(f"Player A chose: {revealed_move_A}")
        print(f"Player B chose: {revealed_move_B}")
        
        # Determine and print the winner
        result = determine_winner(revealed_move_A, revealed_move_B)
        print(f"\nResult: {result}")
        
        if "wins" in result:
            print("\nThe winner's revealed move and secret serve as the SUCCINCT PROOF of victory!")

    else:
        print("❌ CHEATING DETECTED!")
        if not is_A_valid:
            print("Player A's revealed move/secret does not match their original commitment!")
        if not is_B_valid:
            print("Player B's revealed move/secret does not match their original commitment!")

# This line makes the game start when you run the file
if __name__ == "__main__":
    play_game() 
    