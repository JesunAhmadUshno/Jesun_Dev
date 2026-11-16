"""Prefix every selector in a CSS chunk with a scope class (keeps @keyframes, handles @media)."""
import re, sys
def split_blocks(css):
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: break
        sel = css[i:j].strip(); depth, k = 1, j + 1
        while depth and k < n:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        out.append((sel, css[j + 1:k - 1])); i = k
    return out
def scope(css, pre):
    res = []
    for sel, body in split_blocks(re.sub(r'/\*.*?\*/', '', css, flags=re.S)):
        if sel.startswith('@keyframes'): res.append(f'{sel}{{{body}}}')
        elif sel.startswith('@media') or sel.startswith('@supports'): res.append(f'{sel}{{{scope(body, pre)}}}')
        else:
            parts = [p.strip() for p in sel.split(',')]
            res.append(','.join(p if p.startswith(pre) else f'{pre} {p}' for p in parts) + '{' + body + '}')
    return '\n'.join(res)
if __name__ == '__main__':
    src, pre = sys.argv[1], sys.argv[2]
    print(scope(open(src).read(), pre))
