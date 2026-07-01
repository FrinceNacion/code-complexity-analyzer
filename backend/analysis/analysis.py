import os, sys
import json
import argparse

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="code complexity analyzer",
        description="Analyze Python source code complexity.",
    )
    parser.add_argument("file", help="Path to the Python file to analyze")
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw JSON instead of a formatted table",
    )
    return parser
 
def print_table(parsed_output: dict) -> None:
    functions = parsed_output.get("functions", [])

    print()
    print(f"  File: {parsed_output.get('file_path', '')}")
    print(f"  Functions: {len(functions)}  |  "
          f"File cyclomatic complexity: {parsed_output['features'].cyclomatic_complexity}  |  "
          f"Max depth: {parsed_output['features'].max_nesting_depth}")
    print()
 
    if not functions:
        print(f"  No functions found in file. \n")
        return
 
    # Column widths
    name_w = max(len(function["name"]) for function in functions)
    name_w = max(name_w, 8)
    line_w = len("Line No.")
    cc_w = len("Cyclomatic Complexity")
    depth_w = len("Nesting Depth")
    loops_w = len("Loops")
    risk_w = max(len(function['features'].risk_level) for function in functions)
    big_o_w = max(len(str(function.get("big_o"))) for function in functions)
    big_o_w = max(big_o_w, len("Big-O"))

    header = (
        f"{'Function':<{name_w}}  "
        f"{'Line No.':>{line_w}}  "
        f"{'Cyclomatic Complexity':>{cc_w}}  "
        f"{'Nesting Depth':>{depth_w}}  "
        f"{'Loops':>{loops_w}}  "
        f"{'Risk':<{risk_w}}"
    )

    separator = (
        f"{'-' * name_w}  "
        f"{'-' * line_w}  "
        f"{'-' * cc_w}  "
        f"{'-' * depth_w}  "
        f"{'-' * loops_w}  "
        f"{'-' * risk_w}"
    )
 
    print(header)
    print(separator)
 
    # Sort by cyclomatic complexity descending (worst first)
    for function in sorted(functions, key=lambda x: x["features"].cyclomatic_complexity, reverse=True):
        print(
            f"{function['name']:<{name_w}}  "
            f"{function['line']:>{line_w}}  "
            f"{function['features'].cyclomatic_complexity:>{cc_w}}  "
            f"{function['features'].max_nesting_depth:>{depth_w}}  "
            f"{function['features'].loop_count:>{loops_w}}  "
            f"{function['features'].risk_level:<{risk_w}}"
        )
 
    print(separator)
    hotspots = [function for function in functions if function["features"].cyclomatic_complexity > 10]
    if hotspots:
        print(f"\n  ⚠  {len(hotspots)} hotspot(s) detected (complexity > 10): "
              f"{', '.join(function['name'] for function in hotspots)}")
    print()

def analyze(file_path: str, as_json: bool) -> int:
    from analysis.parser_python import parse_python_file
    from analysis.call_graph import build_graph

    #if not os.path.isabs(file_path):
    #    file_path = os.path.abspath(file_path)

    if not os.path.exists(file_path):
        print(f"Error: file not found: {file_path}", file=sys.stderr)
        return 1
    
    if not os.path.isfile(file_path):
        print(f"Error: path is not a file: {file_path}", file=sys.stderr)
        return 1
    
    if not file_path.endswith(".py"):
        print(f"Error: only .py files are supported (got {file_path})", file=sys.stderr)
        return 1

    parsed_output = parse_python_file(file_path)

    if parsed_output is None:
        print("Error: failed to parse file.", file=sys.stderr)
        return 1
    
    functions = parsed_output.get("functions", [])
    
    if functions:
        try:
            from ml.predict import predict_big_o
            for function in functions:
                prediction = predict_big_o(function["features"])
                function["big_o"] = prediction["label"]
                function["big_o_confidence"] = prediction["confidence"]
        except FileNotFoundError:
            for function in functions:
                function["big_o"] = None
                function["big_o_confidence"] = None
    
    parsed_output['functions'] = functions
    parsed_output['file_path'] = file_path
    graph = build_graph(parsed_output)

    print_table(parsed_output)

    if as_json:
        print('JSON:')
        output = {
            "file": file_path,
            "summary": {
                "total_functions": len(parsed_output.get("functions", [])),
                "cyclomatic_complexity": parsed_output["features"].cyclomatic_complexity,
                "max_nesting_depth": parsed_output["features"].max_nesting_depth,
                "hotspots": [
                    function["name"]
                    for function  in parsed_output.get("functions", [])
                    if function["features"].cyclomatic_complexity > 10
                ],
            },
            "functions": parsed_output.get("functions", []),
            "call_graph": graph,
        }
        # Remove non-serializable body before dumping
        for function in output["functions"]:
            function.pop("body", None)
        print(json.dumps(output, indent=2, default=str))

    return 0

def main():
    parser = build_parser()
    args = parser.parse_args()
    sys.exit(analyze(file_path=args.file, as_json=args.json))
    
if __name__ == '__main__':
    main()