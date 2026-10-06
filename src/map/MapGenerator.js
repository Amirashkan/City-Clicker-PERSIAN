export function generateMapMask(width,height,seed=Math.random()) {
  const cx=(width-1)/2, cy=(height-1)/2;
  const maxR=Math.min(width,height)*.47;
  const points=[];
  const count=12;
  const rand=(n)=> {
    const x=Math.sin(seed*1000+n*78.233)*43758.5453;
    return x-Math.floor(x);
  };
  for(let i=0;i<count;i++){
    points.push(.78+rand(i)*.34);
  }
  const radii=[];
  for(let i=0;i<count;i++){
    const a=points[(i-1+count)%count],b=points[i],c=points[(i+1)%count];
    radii.push((a+b*2+c)/4);
  }
  const mask=Array.from({length:height},()=>Array(width).fill(false));
  for(let y=0;y<height;y++) for(let x=0;x<width;x++){
    const dx=x-cx,dy=y-cy;
    const d=Math.hypot(dx,dy);
    if(d>maxR*1.05) continue;
    let angle=Math.atan2(dy,dx);
    if(angle<0) angle+=Math.PI*2;
    const pos=angle/(Math.PI*2)*count;
    const i=Math.floor(pos)%count, t=pos-Math.floor(pos);
    const radius=maxR*(radii[i]*(1-t)+radii[(i+1)%count]*t);
    const edgeNoise=(rand(x*31+y*17+3)-.5)*.22;
    if(d<=radius*(1+edgeNoise)) mask[y][x]=true;
  }
  // Keep the center and close tiny edge gaps so the playable area stays one
  // continuous, city-like land mass rather than becoming scattered islands.
  mask[Math.floor(cy)][Math.floor(cx)]=true;
  for(let pass=0;pass<2;pass++){
    const copy=mask.map(row=>row.slice());
    for(let y=1;y<height-1;y++) for(let x=1;x<width-1;x++){
      const n=(mask[y-1][x]?1:0)+(mask[y+1][x]?1:0)+(mask[y][x-1]?1:0)+(mask[y][x+1]?1:0);
      if(n>=3) copy[y][x]=true;
    }
    for(let y=0;y<height;y++) for(let x=0;x<width;x++) mask[y][x]=copy[y][x];
  }
  return mask;
}
