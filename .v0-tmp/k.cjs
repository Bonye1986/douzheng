const sharp=require('/tmp/node_modules/sharp');
(async()=>{
 const bbox=async f=>{const {data,info}=await sharp(f).ensureAlpha().raw().toBuffer({resolveWithObject:true});let x0=1e9,y0=1e9,x1=-1,y1=-1;for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){if(data[(y*info.width+x)*4+3]>20){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}return {w:info.width,h:info.height,x0,y0,x1,y1}};
 for(const n of ['svc-tests','svc-health','svc-remind','sec-knowledge'])console.log(n,JSON.stringify(await bbox('public/images/icons/'+n+'.png')));
 const {data,info}=await sharp('.v0-tmp/svc-knowledge-raw.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2];const m=Math.min(r,g,b);const dist=255-m; // whiteness
  const a=Math.max(0,Math.min(255,(dist-6)*255/40));
  if(a<255){ // unpremultiply against white
   const af=a/255; if(af>0){data[i]=Math.max(0,Math.min(255,(r-255*(1-af))/af));data[i+1]=Math.max(0,Math.min(255,(g-255*(1-af))/af));data[i+2]=Math.max(0,Math.min(255,(b-255*(1-af))/af));}
   data[i+3]=a;}}
 const cut=await sharp(data,{raw:info}).png().toBuffer();
 const t=await sharp(cut).trim({threshold:1}).toBuffer({resolveWithObject:true});
 console.log('trim',t.info.width,t.info.height);
 const ref=await bbox('public/images/icons/svc-health.png');
 const S=ref.w, targetH=Math.round((ref.y1-ref.y0+1)*1.0);
 const scale=Math.min(targetH/t.info.height,(S*0.9)/t.info.width);
 const w=Math.round(t.info.width*scale),h=Math.round(t.info.height*scale);
 const r=await sharp(t.data).resize(w,h).toBuffer();
 await sharp({create:{width:S,height:ref.h,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:r,left:Math.round((S-w)/2),top:ref.y1+1-h}]).png().toFile('public/images/icons/svc-knowledge.png');
 console.log('out',JSON.stringify(await bbox('public/images/icons/svc-knowledge.png')));
 const row=await Promise.all(['svc-tests','svc-health','svc-knowledge','svc-remind'].map(async(n,i)=>({input:await sharp('public/images/icons/'+n+'.png').resize(200,200,{fit:'contain',background:{r:255,g:255,b:255,alpha:0}}).png().toBuffer(),left:i*200,top:0})));
 await sharp({create:{width:800,height:200,channels:4,background:'#ffffff'}}).composite(row).png().toFile('.v0-tmp/row.png');
})();
