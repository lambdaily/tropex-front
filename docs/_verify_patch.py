# -*- coding: utf-8 -*-
import sys; sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.text.paragraph import Paragraph
from docx.oxml.ns import qn

src, out = sys.argv[1], sys.argv[2]

def analyze(path):
    d = Document(path)
    body = d.element.body
    imgs = sum(1 for el in body if ('w:drawing' in el.xml or 'a:blip' in el.xml))
    before, after_heads, cut = [], [], None
    in13 = False
    for el in body:
        if el.tag == qn('w:p'):
            p = Paragraph(el, d)
            t = p.text
            is13 = (p.style and p.style.name == 'Heading 1' and t.strip().startswith('13.'))
            if is13:
                in13 = True
            if not in13:
                before.append(t)
            else:
                if p.style and p.style.name.startswith('Heading'):
                    after_heads.append((p.style.name, t.strip()))
    sect_last = body[-1].tag == qn('w:sectPr')
    n_tbl = len(d.tables)
    return d, imgs, before, after_heads, sect_last, n_tbl

d1, i1, b1, _, _, t1 = analyze(src)
d2, i2, b2, h2, slast, t2 = analyze(out)

print('Images  — original:', i1, '| patched:', i2, '=>', 'OK' if i1==i2 else 'MISMATCH')
print('Tables  — original:', t1, '| patched:', t2)
print('Pre-§13 paragraphs — original:', len(b1), '| patched:', len(b2))
diffs = sum(1 for a,b in zip(b1,b2) if a!=b) + abs(len(b1)-len(b2))
print('Pre-§13 content identical:', 'YES (0 diffs)' if (b1==b2) else f'NO ({diffs} diffs)')
if b1!=b2:
    for k,(a,b) in enumerate(zip(b1,b2)):
        if a!=b:
            print(f'   first diff @ {k}: [{a[:50]}] != [{b[:50]}]'); break
print('sectPr is last child:', 'OK' if slast else 'MISSING')
print('\nNew §13 headings:')
for st,t in h2:
    print('  ', st, '|', t)
