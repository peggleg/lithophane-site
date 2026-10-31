# Import a text-free 3 × 2 technical stencil board into existing vector templates.
# Requires OpenCV and NumPy; runtime generation uses only the committed JSON.
import cv2,numpy as np,json,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'src'/'ornament-artwork'
import subprocess
collection,path=sys.argv[1:]
catalogue=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {ornamentCollections} from './src/ornament-settings.js';console.log(JSON.stringify(ornamentCollections))"],cwd=root.parents[1]))
catalog=catalogue[collection]
im=cv2.imread(path);height,width=im.shape[:2]
for index,(design,_) in enumerate(catalog['designs']):
 col=index%3;row=index//3;crop=im[round(row*height/2):round((row+1)*height/2),round(col*width/3):round((col+1)*width/3)];mask=(cv2.cvtColor(crop,cv2.COLOR_BGR2GRAY)<128).astype(np.uint8)*255
 outside,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);border=max(outside,key=cv2.contourArea);bx,by,bw,bh=cv2.boundingRect(border);pts=border[:,0,:];body=pts[pts[:,1]>by+bh*.17].astype(np.float32);(cx,cy),_,_=cv2.fitEllipse(body.reshape((-1,1,2)));rx=bw/2;ry=by+bh-cy
 if not .8*rx<ry<1.2*rx:ry=rx;cy=by+bh-ry
 Y,X=np.indices(mask.shape);mask[((X-cx)/rx)**2+((Y-cy)/ry)**2>1.002]=0
 found,_=cv2.findContours(mask,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE);result=[]
 for contour in found:
  if abs(cv2.contourArea(contour))<2:continue
  curve=cv2.approxPolyDP(contour,.35,True)[:,0,:].astype(np.float32)
  for _ in range(2):
   follow=np.roll(curve,-1,axis=0);curve=np.stack([.75*curve+.25*follow,.25*curve+.75*follow],axis=1).reshape((-1,2))
  curve=cv2.approxPolyDP(curve,.12,True)[:,0,:]
  if len(curve)>2:result.append([[round((float(x)-cx)/rx*50,4),round((cy-float(y))/ry*50,4)]for x,y in curve])
 file=root/f'{collection}-{design}.json';data=json.loads(file.read_text());data['frame']=result;file.write_text(json.dumps(data,separators=(',',':'))+'\n');print(collection,design,len(result))
