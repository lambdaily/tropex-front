# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.oxml.ns import qn

path = sys.argv[1]
d = Document(path)
body = d.element.body

def has_img(el):
    x = el.xml
    return ('w:drawing' in x) or ('pic:pic' in x) or ('a:blip' in x)

children = list(body)
print('Total body children:', len(children))
imgs = 0
sect = 0
print('\n=== Body outline (idx | tag | style | img | text) ===')
from docx.text.paragraph import Paragraph
from docx.table import Table
for i, el in enumerate(children):
    tag = el.tag.split('}')[-1]
    if tag == 'p':
        p = Paragraph(el, d)
        img = has_img(el)
        if img: imgs += 1
        style = p.style.name if p.style else '?'
        txt = p.text.strip().replace('\n',' ')[:70]
        mark = ''
        if style.startswith('Heading') or style == 'Title':
            mark = '  <<<<< HEADING'
        if img:
            print(f'{i:3} | p   | {style:14} | IMG | {txt}{mark}')
        elif style.startswith('Heading') or style=='Title' or txt:
            print(f'{i:3} | p   | {style:14} |     | {txt}{mark}')
    elif tag == 'tbl':
        t = Table(el, d)
        first = ' '.join(c.text for c in t.rows[0].cells)[:50] if t.rows else ''
        print(f'{i:3} | tbl | (table {len(t.rows)}x{len(t.columns)}) |   | {first}')
    elif tag == 'sectPr':
        sect += 1
        print(f'{i:3} | sectPr (body-level section properties)')
    else:
        print(f'{i:3} | {tag}')

print('\nTotal inline images:', imgs)
print('Body-level sectPr:', sect)

# Find section 13 heading
print('\n=== Locating last section (matchmaking) ===')
for i, el in enumerate(children):
    if el.tag.split('}')[-1] == 'p':
        p = Paragraph(el, d)
        t = p.text.strip()
        if ('Ranking de ofertas' in t) or t.startswith('13.') or ('matchmaking' in t.lower()) or ('Notas de producto' in t):
            print(f'  match at idx {i}: [{p.style.name}] {t[:80]}')
