import sys, pymupdf, numpy as np
from paddleocr import PaddleOCR

pdf = 'D:/0-学习资料新版/雅思真题/词汇真经pdf.pdf'
doc = pymupdf.open(pdf)
print('pages', len(doc))
ocr = PaddleOCR(use_angle_cls=True, lang='ch', show_log=False)
pages = [int(x) for x in sys.argv[1:]] if len(sys.argv) > 1 else list(range(len(doc)))
out = []
for pi in pages:
    if pi >= len(doc):
        continue
    pix = doc[pi].get_pixmap(dpi=170)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
    res = ocr.ocr(img, cls=True)
    out.append('=== page %d ===' % pi)
    for line in (res[0] or []):
        out.append(line[1][0])
text = '\n'.join(out)
open('D:/Workbuddy工作台/易欢的工作台/workbench/data/ielts_words_ocr.txt', 'w', encoding='utf-8').write(text)
print('written', len(out), 'lines')
print(text[:3000])
