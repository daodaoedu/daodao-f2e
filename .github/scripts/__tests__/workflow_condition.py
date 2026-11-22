import ast
import re


def workflow_condition(expression, context):
    if not expression:
        return True
    expression = expression.strip()
    if expression.startswith("${{") and expression.endswith("}}"):
        expression = expression[3:-2].strip()

    def token(match):
        value = match.group()
        if value.startswith("'"):
            return repr(value[1:-1].replace("''", "'"))
        if value in context:
            return repr(context[value])
        if value in {"true", "false", "null", "&&", "||"}:
            return {
                "true": "True",
                "false": "False",
                "null": "None",
                "&&": " and ",
                "||": " or ",
            }[value]
        if value == "always":
            return value
        raise AssertionError(f"Unsupported workflow token: {value}")

    expression = re.sub(
        r"'(?:''|[^'])*'|[A-Za-z_][A-Za-z0-9_.-]*|&&|\|\|", token, expression
    )

    def equal(left, right):
        if isinstance(left, str) and isinstance(right, str):
            return left.lower() == right.lower()
        if type(left) is type(right):
            return left == right

        def number(value):
            if value is None or value == "":
                return 0.0
            try:
                return float(value)
            except (TypeError, ValueError):
                return float("nan")

        return number(left) == number(right)

    def value(node):
        if isinstance(node, ast.Expression):
            return value(node.body)
        if isinstance(node, ast.Constant):
            return node.value
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Name)
            and node.func.id == "always"
            and not node.args
        ):
            return True
        if isinstance(node, ast.BoolOp):
            values = [bool(value(v)) for v in node.values]
            return all(values) if isinstance(node.op, ast.And) else any(values)
        if isinstance(node, ast.Compare):
            left = value(node.left)
            for op, right_node in zip(node.ops, node.comparators):
                right = value(right_node)
                matched = equal(left, right)
                if not (
                    (isinstance(op, ast.Eq) and matched)
                    or (isinstance(op, ast.NotEq) and not matched)
                ):
                    return False
                left = right
            return True
        raise AssertionError("Unsupported workflow condition")

    return value(ast.parse(expression.strip(), mode="eval"))
