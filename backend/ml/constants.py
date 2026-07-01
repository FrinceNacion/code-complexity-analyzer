import os

current_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(current_dir, "data", "snippets.csv")
model_path = os.path.join(current_dir, "model", "model.pkl")