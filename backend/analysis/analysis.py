import os, sys
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
 
def risk_label(complexity: int) -> str:
    if complexity <= 4:
        return "low"
    if complexity <= 7:
        return "medium"
    if complexity <= 10:
        return "high"
    return "critical"
 
def print_table(parsed_output: dict) -> None:
    functions = parsed_output.get("functions", [])
 
    if not functions:
        print("No functions found in file.")
        return
 
    # Column widths
    name_w = max(len(f["name"]) for f in functions)
    name_w = max(name_w, 8)
    line_w = len("Line No.")
    cc_w = len("Cyclomatic Complexity")
    depth_w = len("Nesting Depth")
    loops_w = len("Loops")
    risk_w = len("Risk")

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
 
    print()
    print(f"  File: {parsed_output.get('file_path', '')}")
    print(f"  Functions: {len(functions)}  |  "
          f"File cyclomatic complexity: {parsed_output['features'].cyclomatic_complexity}  |  "
          f"Max depth: {parsed_output['features'].max_nesting_depth}")
    print()
    print(header)
    print(separator)
 
    # Sort by cyclomatic complexity descending (worst first)
    for function in sorted(functions, key=lambda x: x["features"].cyclomatic_complexity, reverse=True):
        risk = risk_label(function["features"].cyclomatic_complexity)
        print(
            f"{function['name']:<{name_w}}  "
            f"{function['line']:>{line_w}}  "
            f"{function['features'].cyclomatic_complexity:>{cc_w}}  "
            f"{function['features'].max_nesting_depth:>{depth_w}}  "
            f"{function['features'].loop_count:>{loops_w}}  "
            f"{risk:<{risk_w}}"
        )
 
    print(separator)
    hotspots = [function for function in functions if function["features"].cyclomatic_complexity > 10]
    if hotspots:
        print(f"\n  ⚠  {len(hotspots)} hotspot(s) detected (complexity > 10): "
              f"{', '.join(function['name'] for function in hotspots)}")
    print()

def analyze(file_path: str, as_json: bool = False) -> int:
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
    
    parsed_output['file_path'] = file_path
    graph = build_graph(parsed_output)

    print_table(parsed_output)

    return 0

def main():
    parser = build_parser()
    args = parser.parse_args()
    sys.exit(analyze(file_path=args.file, as_json=False))
    
if __name__ == '__main__':
    main()