from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path('/mnt/data/SHANERYN_Editorial_Treatment_V3')
out=Path('/mnt/data/SHANERYN_Editorial_Treatment_V3.zip')
exclude={'build_v3.py','make_previews.py','make_gallery_preview.py','static_qa.py','qa_v3.py','http.log','static_qa.log','README_V3.md','QA_REPORT_V2.md','bg_test.png','hi.png','monogram_view.png'}
with ZipFile(out,'w',compression=ZIP_DEFLATED,compresslevel=6) as z:
 for f in sorted(root.rglob('*')):
  if not f.is_file() or f.name in exclude or f.name.startswith('.'):continue
  rel=f.relative_to(root.parent)
  z.write(f,str(rel))
print('PACKAGED:',out,'BYTES',out.stat().st_size)
with ZipFile(out) as z:
 print('ENTRIES',len(z.namelist()))
 print('ZIP_INTEGRITY',z.testzip() or 'PASS')
 print('HAS_START_PAGE',any(x.endswith('SHANERYN_Editorial_Treatment_V3/index.html') for x in z.namelist()))
