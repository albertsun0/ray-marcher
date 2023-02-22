import { Mat4, Vec3 } from "../lib/TSM.js";
/**
 * Represents a Menger Sponge
 */
export class MengerSponge {
    constructor(level) {
        // TODO: sponge data structures
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        //cube verticies and trianges adapted from 
        //http://ilkinulas.github.io/development/unity/2016/04/30/cube-mesh-in-unity3d.html
        this.cubeVertices = [
            new Vec3([0, 0, 0]),
            new Vec3([1, 0, 0]),
            new Vec3([1, 1, 0]),
            new Vec3([0, 1, 0]),
            new Vec3([0, 1, 1]),
            new Vec3([1, 1, 1]),
            new Vec3([1, 0, 1]),
            new Vec3([0, 0, 1]),
        ];
        this.cubeTraingles = [
            0, 2, 1,
            0, 3, 2,
            2, 3, 4,
            2, 4, 5,
            1, 2, 5,
            1, 5, 6,
            0, 7, 4,
            0, 4, 3,
            5, 4, 7,
            5, 7, 6,
            0, 6, 7,
            0, 1, 6
        ];
        //index of squares to remove from cube
        this.removeIndex = [4, 10, 12, 13, 14, 16, 22];
        this.setLevel(level);
        // TODO: other initialization	
    }
    /**
     * Returns true if the sponge has changed.
     */
    isDirty() {
        return true;
    }
    setClean() {
    }
    setLevel(level) {
        // TODO: initialize the cube
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.gen([-0.5, -0.5, -0.5], 1, level);
    }
    //draw a cube from start [x,y,z] with width/height of width
    //remember right hand rule
    // looking at right hand, +x is thumb / left
    // index finger is +y / up
    // middle finger pointing forwards is +z / towards you / backwards
    drawCube(start, width) {
        let verticiesix = this.vertices.length / 4;
        //push all 8 vertices with offset
        for (let i = 0; i < 8; i++) {
            this.vertices.push(this.cubeVertices[i].x * width + start[0], this.cubeVertices[i].y * width + start[1], this.cubeVertices[i].z * width + start[2], 1);
        }
        //push all triangles
        for (let i = 0; i < 12 * 3; i++) {
            this.indices.push(this.cubeTraingles[i] + verticiesix);
            //set normals
        }
        //normals, not sure if correct
        this.normals.push(0, 0, 1, 0);
        this.normals.push(0, 0, 1, 0);
        //top
        this.normals.push(0, 1, 0, 0);
        this.normals.push(0, 1, 0, 0);
        //right
        this.normals.push(1, 0, 0, 0);
        this.normals.push(1, 0, 0, 0);
        //left
        this.normals.push(-1, 0, 0, 0);
        this.normals.push(-1, 0, 0, 0);
        //back
        this.normals.push(0, 0, -1, 0);
        this.normals.push(0, 0, -1, 0);
        //bottom
        this.normals.push(0, -1, 0, 0);
        this.normals.push(0, -1, 0, 0);
    }
    //recursively split the current cube into 27 smaller cubes, removing the middles
    gen(start, width, level) {
        if (level <= 1) {
            //add cube
            this.drawCube(start, width);
            return;
        }
        else {
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                    for (let z = 0; z < 3; z++) {
                        let index = z + x * 3 + y * 9;
                        //loop through all 27 cubes, from bottom to top
                        //if cube is in remove list, dont draw it
                        if (this.removeIndex.indexOf(index) == -1) {
                            //copy starting point
                            let newStart = [...start];
                            //translate starting point to starting point of smaller cube
                            newStart[0] += x * width / 3;
                            newStart[2] += z * width / 3;
                            newStart[1] += y * width / 3;
                            //generate smaller cube
                            this.gen(newStart, width / 3, level - 1);
                        }
                    }
                }
            }
        }
    }
    /* Returns a flat Float32Array of the sponge's vertex positions */
    positionsFlat() {
        // TODO: right now this makes a single triangle. Make the cube fractal instead.
        return new Float32Array(this.vertices);
    }
    /**
     * Returns a flat Uint32Array of the sponge's face indices
     */
    indicesFlat() {
        // TODO: right now this makes a single triangle. Make the cube fractal instead.
        return new Uint32Array(this.indices);
    }
    /**
     * Returns a flat Float32Array of the sponge's normals
     */
    normalsFlat() {
        // TODO: right now this makes a single triangle. Make the cube fractal instead.
        return new Float32Array(this.normals);
    }
    /**
     * Returns the model matrix of the sponge
     */
    uMatrix() {
        // TODO: change this, if it's useful
        const ret = new Mat4().setIdentity();
        return ret;
    }
}
//# sourceMappingURL=MengerSponge.js.map