import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";

/* A potential interface that students should implement */
interface ITerrain {
  normalsFlat(): Float32Array;
  indicesFlat(): Uint32Array;
  positionsFlat(): Float32Array;
}

/**
 * Represents Terrain
 */
export class Terrain implements ITerrain {

  vertices : number[] = [];
  indices : number[] = [];
  normals : number[] = [];

  size : number = 500;

  NoiseGrid: number[][] = [];

  nodes:number = this.size;

  starty:number = -3;

  randomHeight() : number {
    let angle = Math.random() * 2 * Math.PI;
    return Math.cos(angle);
  }

  populateGrid(): void {
    for(let i = 0; i < this.nodes; i++){
        let temp:number[] = [];
        for(let j = 0; j < this.nodes; j++){
            temp.push(this.randomHeight());
            //console.log(temp[j]);
        }
        this.NoiseGrid.push([...temp]);
    }
  }

  fade(t:number){
    //perlin noise optimized ease function
    return ((6 * t - 15) * t + 10) * t * t * t;
  }

  interpolate(lo: number, hi: number, t: number): number{ 
    return lo + t * (hi - lo);
  }
  
  noise(x:number, y:number) : number {
    //woohoo interpolation
    let scale = this.size/this.nodes;
    let x0 = Math.floor(x / scale) % this.nodes;
    let y0 = Math.floor(y / scale) % this.nodes;
    let x1 = (x0 + 1) % this.nodes;
    let y1 = (y0 + 1) % this.nodes;
    
    let dx = (x - x0 * scale)/scale;
    let dy = (y - y0* scale )/scale;
    // console.log(x, y);
    // console.log(x0, y0, x1, y1);
    // console.log(dx, dy);
    let br = this.NoiseGrid[x0][y0];
	let tr = this.NoiseGrid[x0][y1];
	let bl = this.NoiseGrid[x1][y0];
	let tl = this.NoiseGrid[x1][y1];
    
    //console.log(br, tl, bl, tl);
    let u = this.fade(dx);
	let v = this.fade(dy);
    let ix = this.interpolate(bl, tl, v);
	let ix1 = this.interpolate(br, tr, v);
	let ans = this.interpolate(ix, ix1, u);
    //console.log(ans);
    return ans;
  }

  FBM(x: number, y:number){
    let result = 0.0;
	let amplitude = 4.0;
	let frequency = 0.05;

	for (let octave = 0; octave < 4; octave++) {
		let n = amplitude * this.noise(x * frequency, y * frequency);
		result += n;
		
		amplitude *= 0.5;
		frequency *= 2.0;
	}

	return result;
  }

  gen() : void {
    this.populateGrid();
    //populate vertices
    for(let i = -this.size/2; i < this.size/2; i++){
        for(let j = -this.size/2; j < this.size/2; j++){
            this.vertices.push(i, this.starty + this.FBM(i + this.size/2, j + this.size/2), j, 1);
            this.normals.push(1.0,0.0,0.0,0.0);
        }
    }
    //connect vertices with triangles
    for(let i = 0; i < this.size - 1; i++){
        for(let j = 0; j < this.size - 1; j++){
            /*
                *---*---
                | / |
                *---*---
                bl   br
            */
            
            let bl = this.size * (i + 1) + j;
            let br = this.size * (i + 1) + j+1;
            this.indices.push(this.size * i + j, this.size * i + j+1, bl);
            this.indices.push(bl, this.size * i + j+1, br);
        }
    }
    //what about normals ??
    //too hard lol
  }

  constructor() {
    this.gen();
    console.log(this.vertices);
    console.log(this.indices);
  }

  /* Returns a flat Float32Array of the sponge's vertex positions */
  public positionsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
	  return new Float32Array(this.vertices);
  }

  /**
   * Returns a flat Uint32Array of the sponge's face indices
   */
  public indicesFlat(): Uint32Array {
    // TODO: right now this makes a single triangle. Make the cube fractal instead.
    return new Uint32Array(this.indices);
  }

  /**
   * Returns a flat Float32Array of the sponge's normals
   */
  public normalsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
	  return new Float32Array(this.normals);
  }

  /**
   * Returns the model matrix of the sponge
   */
  public uMatrix(): Mat4 {

    // TODO: change this, if it's useful
    const ret : Mat4 = new Mat4().setIdentity();

    return ret;    
  }
  
}
