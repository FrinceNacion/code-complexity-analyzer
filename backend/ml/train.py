import os
import sys
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

from ml.features import FEATURE_NAMES, vector_from_code
from ml.constants import csv_path, model_path

def main():
    if not os.path.exists(csv_path):
        print(f"Error: dataset file not found at {csv_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Loading training data from {csv_path}...")
    df = pd.read_csv(csv_path)

    X = []
    y = []

    print("Extracting features from code snippets...")
    # TODO: use more features, not just label and code. loops, conditionals, etc.
    for idx, row in df.iterrows():
        code = row["code"]
        label = row["big_o_label"]
        try:
            vector = vector_from_code(code)
            X.append(vector)
            y.append(label)
        except SyntaxError as e:
            print(f"Warning: SyntaxError at row index {idx}, skipping snippet. Error: {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"Warning: Unexpected error at row index {idx}, skipping. Error: {e}", file=sys.stderr)
            continue

    if not X:
        print("Error: No valid feature vectors were extracted.", file=sys.stderr)
        sys.exit(1)

    print(f"Extracted {len(X)} feature vectors.")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training RandomForestClassifier...")
    classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    classifier.fit(X_train, y_train)

    y_pred = classifier.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print("\n--- Test Split Evaluation ---")
    print(f"Overall Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Assert/require overall accuracy > 0.80
    if accuracy <= 0.80:
        print(f"\n[WARNING] Overall accuracy {accuracy:.4f} is not above the 0.80 threshold!", file=sys.stderr)
        print("Please expand backend/ml/data/snippets.csv with more diverse training data before saving.", file=sys.stderr)
        sys.exit(1)

    print(f"Saving model to {model_path}...")
    model_data = {
        "model": classifier,
        "feature_names": FEATURE_NAMES
    }
    joblib.dump(model_data, model_path)
    print("Model serialized successfully.")

if __name__ == "__main__":
    main()
