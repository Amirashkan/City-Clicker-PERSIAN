export class IsoProjection {
  constructor({tileWidth=72,tileHeight=36,originX=0,originY=0}={}) {
    this.tileWidth=tileWidth; this.tileHeight=tileHeight;
    this.originX=originX; this.originY=originY;
  }
  worldToScreen(x,y,z=0) {
    return {
      x:this.originX+(x-y)*this.tileWidth/2,
      y:this.originY+(x+y)*this.tileHeight/2-z
    };
  }
  screenToWorld(sx,sy) {
    const dx=(sx-this.originX)*2/this.tileWidth;
    const dy=(sy-this.originY)*2/this.tileHeight;
    return {x:(dx+dy)/2,y:(dy-dx)/2};
  }
  tileAt(sx,sy) {
    const p=this.screenToWorld(sx,sy);
    return {x:Math.floor(p.x),y:Math.floor(p.y)};
  }
}