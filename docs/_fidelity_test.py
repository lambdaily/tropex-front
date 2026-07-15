# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.text.paragraph import Paragraph

src = sys.argv[1]
tmp = sys.argv[2]

def imgcount(doc):
    return sum(1 for el in doc.element.body if ('w:drawing' in el.xml or 'a:blip' in el.xml))

def para_texts(doc):
    out = []
    for el in doc.element.body:
        if el.tag.split('}')[-1] == 'p':
            out.append(Paragraph(el, doc).text)
    return out

d1 = Document(src)
n_img1 = imgcount(d1)
t1 = para_texts(d1)
# no-op round trip
d1.save(tmp)

d2 = Document(tmp)
n_img2 = imgcount(d2)
t2 = para_texts(d2)

print('Images before:', n_img1, '| after round-trip:', n_img2)
print('Paragraph count before:', len(t1), '| after:', len(t2))
# compare pre-cut paragraphs (up to "Fin del documento")
diffs = 0
for i in range(min(len(t1), len(t2))):
    if t1[i] != t2[i]:
        diffs += 1
        if diffs <= 5:
            print(f'  DIFF idx {i}: [{t1[i][:40]}] != [{t2[i][:40]}]')
print('Text diffs:', diffs)
print('FIDELITY:', 'OK' if (n_img1 == n_img2 and t1 == t2) else 'MISMATCH')
