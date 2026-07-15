# -*- coding: utf-8 -*-
import io, os
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
docs = os.path.join(base, 'docs')
md = io.open(os.path.join(docs, 'USER_STORIES.md'), encoding='utf-8').read()
new13 = io.open(os.path.join(docs, '_section13.md'), encoding='utf-8').read().strip() + '\n'
lines = md.split('\n')
cut = next(i for i, l in enumerate(lines) if l.startswith('## 13.'))
synced = '\n'.join(lines[:cut]).rstrip() + '\n\n' + new13
io.open(os.path.join(docs, 'USER_STORIES.md'), 'w', encoding='utf-8').write(synced)
print('USER_STORIES.md synced; replaced from line', cut)
