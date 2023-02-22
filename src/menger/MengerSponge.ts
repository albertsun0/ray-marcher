import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";

/* A potential interface that students should implement */
interface IMengerSponge {
  setLevel(level: number): void;
  isDirty(): boolean;
  setClean(): void;
  normalsFlat(): Float32Array;
  indicesFlat(): Uint32Array;
  positionsFlat(): Float32Array;
}

/**
 * Represents a Menger Sponge
 */
export class MengerSponge implements IMengerSponge {

  // TODO: sponge data structures
  vertices : number[] = [];
  indices : number[] = [];
  normals : number[] = [];

  //cube verticies and trianges adapted from 
  //http://ilkinulas.github.io/development/unity/2016/04/30/cube-mesh-in-unity3d.html
  cubeVertices: Vec3[] = [
    new Vec3([0, 0, 0]),
    new Vec3([1, 0, 0]),
    new Vec3([1, 1, 0]),
    new Vec3([0, 1, 0]),
    new Vec3([0, 1, 1]),
    new Vec3([1, 1, 1]),
    new Vec3([1, 0, 1]),
    new Vec3([0, 0, 1]),
  ];

  cubeTraingles: number[] = [
    0, 2, 1, //face front
    0, 3, 2,
    2, 3, 4, //face top
    2, 4, 5,
    1, 2, 5, //face right
    1, 5, 6,
    0, 7, 4, //face left
    0, 4, 3,
    5, 4, 7, //face back
    5, 7, 6,
    0, 6, 7, //face bottom
    0, 1, 6
  ];

  //index of squares to remove from cube
  removeIndex:number[] = [4,10,12,13,14,16,22];

  constructor(level: number) {
	  this.setLevel(level);
	  // TODO: other initialization	
  }

  /**
   * Returns true if the sponge has changed.
   */
  public isDirty(): boolean {
       return true;
  }

  public setClean(): void {
  }
  
  public setLevel(level: number)
  {
	  // TODO: initialize the cube
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.gen([-0.5,-0.5,-0.5], 1, level);
  }
  
  //draw a cube from start [x,y,z] with width/height of width
  //remember right hand rule
  // looking at right hand, +x is thumb / left
  // index finger is +y / up
  // middle finger pointing forwards is +z / towards you / backwards
  private drawCube(start:number[], width:number){
      let verticiesix = this.vertices.length/4;
      //push all 8 vertices with offset
      for(let i = 0; i < 8; i++){
        this.vertices.push(this.cubeVertices[i].x * width + start[0], 
                          this.cubeVertices[i].y * width + start[1], 
                          this.cubeVertices[i].z * width + start[2], 
                          1);
      }
      //push all triangles
      for(let i = 0; i < 12 * 3; i++){
        this.indices.push(this.cubeTraingles[i] + verticiesix);
        //set normals
      }

      //normals, not sure if correct
      this.normals.push(0,0,1,0);
      this.normals.push(0,0,1,0);
      //top
      this.normals.push(0,1,0,0);
      this.normals.push(0,1,0,0);
      //right
      this.normals.push(1,0,0,0);
      this.normals.push(1,0,0,0);
      //left
      this.normals.push(-1,0,0,0);
      this.normals.push(-1,0,0,0);
      //back
      this.normals.push(0,0,-1,0);
      this.normals.push(0,0,-1,0);
      //bottom
      this.normals.push(0,-1,0,0);
      this.normals.push(0,-1,0,0);
  }

  //recursively split the current cube into 27 smaller cubes, removing the middles
  private gen(start:number[], width:number, level:number):void{
    if(level <= 1){
      //add cube
      this.drawCube(start, width);
      return;
    }
    else{
      for(let y = 0; y < 3; y++){
        for(let x = 0; x < 3; x++){
          for(let z = 0; z < 3; z++){
            let index = z + x * 3 + y * 9;
            //loop through all 27 cubes, from bottom to top
            //if cube is in remove list, dont draw it
            if(this.removeIndex.indexOf(index) == -1){
              //copy starting point
              let newStart = [...start];
              //translate starting point to starting point of smaller cube
              newStart[0] += x * width/3;
              newStart[2] += z * width/3;
              newStart[1] += y * width/3;
              //generate smaller cube
              this.gen(newStart, width/3, level - 1);
            }
          }
        }
      }
    }
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
