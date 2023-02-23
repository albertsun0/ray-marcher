import {
  CanvasAnimation,
  WebGLUtilities
} from "../lib/webglutils/CanvasAnimation.js";
import { GUI } from "./Gui.js";
import { MengerSponge } from "./MengerSponge.js";
import { mengerTests } from "./tests/MengerTests.js";
import { Terrain } from "./Terrain.js";
import {
  defaultFSText,
  defaultVSText,
  floorFSText,
  floorVSText,
  terrainFSText,
  terrainVSText
} from "./Shaders.js";
import { Mat4, Vec4 } from "../lib/TSM.js";

export interface MengerAnimationTest {
  reset(): void;
  setLevel(level: number): void;
  getGUI(): GUI;
  draw(): void;
}

export class MengerAnimation extends CanvasAnimation {
  private gui: GUI;
  
  /* The Menger sponge */
  private sponge: MengerSponge = new MengerSponge(1);

  /* Menger Sponge Rendering Info */
  private mengerVAO: WebGLVertexArrayObjectOES = -1;
  private mengerProgram: WebGLProgram = -1;

  /* Menger Buffers */
  private mengerPosBuffer: WebGLBuffer = -1;
  private mengerIndexBuffer: WebGLBuffer = -1;
  private mengerNormBuffer: WebGLBuffer = -1;

  /* Menger Attribute Locations */
  private mengerPosAttribLoc: GLint = -1;
  private mengerNormAttribLoc: GLint = -1;

  /* Menger Uniform Locations */
  private mengerWorldUniformLocation: WebGLUniformLocation = -1;
  private mengerViewUniformLocation: WebGLUniformLocation = -1;
  private mengerProjUniformLocation: WebGLUniformLocation = -1;
  private mengerLightUniformLocation: WebGLUniformLocation = -1;

  /* Global Rendering Info */
  private lightPosition: Vec4 = new Vec4();
  private backgroundColor: Vec4 = new Vec4();

  // TODO: data structures for the floor

  private floorVAO: WebGLVertexArrayObjectOES = -1;
  private floorProgram: WebGLProgram = -1;

  /* floor Buffers */
  private floorPosBuffer: WebGLBuffer = -1;
  private floorIndexBuffer: WebGLBuffer = -1;
  private floorNormBuffer: WebGLBuffer = -1;

  /* floor Attribute Locations */
  private floorPosAttribLoc: GLint = -1;
  private floorNormAttribLoc: GLint = -1;

  /* fllor Uniform Locations */
  private floorWorldUniformLocation: WebGLUniformLocation = -1;
  private floorViewUniformLocation: WebGLUniformLocation = -1;
  private floorProjUniformLocation: WebGLUniformLocation = -1;
  private floorLightUniformLocation: WebGLUniformLocation = -1;

  // TODO: data structures for the terrain

  private terrain:Terrain = new Terrain();

  private terrainVAO: WebGLVertexArrayObjectOES = -1;
  private terrainProgram: WebGLProgram = -1;

  /* terrain Buffers */
  private terrainPosBuffer: WebGLBuffer = -1;
  private terrainIndexBuffer: WebGLBuffer = -1;
  private terrainNormBuffer: WebGLBuffer = -1;

  /* terrain Attribute Locations */
  private terrainPosAttribLoc: GLint = -1;
  private terrainNormAttribLoc: GLint = -1;

  /* terrain Uniform Locations */
  private terrainWorldUniformLocation: WebGLUniformLocation = -1;
  private terrainViewUniformLocation: WebGLUniformLocation = -1;
  private terrainProjUniformLocation: WebGLUniformLocation = -1;
  private terrainLightUniformLocation: WebGLUniformLocation = -1;
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  //Boolean switch for extra credit terrain

  private DRAW_TERRAIN:boolean = false;

  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.gui = new GUI(canvas, this, this.sponge);

    /* Setup Animation */
    this.reset();
  }

  /**
   * Setup the animation. This can be called again to reset the animation.
   */
  public reset(): void {

    /* debugger; */
    this.lightPosition = new Vec4([-10.0, 10.0, -10.0, 1.0]);
    this.backgroundColor = new Vec4([0.0, 0.37254903, 0.37254903, 1.0]);

    this.initMenger();
    this.initFloor();
    this.initTerrain();
    this.gui.reset();

  }

  /**
   * Initialize the Menger sponge data structure
   */
  public initMenger(): void {
    
    this.sponge.setLevel(1);
    
    /* Alias context for syntactic convenience */
    const gl: WebGLRenderingContext = this.ctx;

    
    /* Compile Shaders */
    this.mengerProgram = WebGLUtilities.createProgram(
      gl,
      defaultVSText,
      defaultFSText
    );
    gl.useProgram(this.mengerProgram);

    /* Create VAO for Menger Sponge */
    this.mengerVAO = this.extVAO.createVertexArrayOES() as WebGLVertexArrayObjectOES;
    this.extVAO.bindVertexArrayOES(this.mengerVAO);

    /* Create and setup positions buffer*/
    // Returns a number that indicates where 'vertPosition' is in the shader program
    this.mengerPosAttribLoc = gl.getAttribLocation(
      this.mengerProgram,
      "vertPosition"
    );
    /* Ask WebGL to create a buffer */
    this.mengerPosBuffer = gl.createBuffer() as WebGLBuffer;
    /* Tell WebGL that you are operating on this buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mengerPosBuffer);
    /* Fill the buffer with data */
    gl.bufferData(gl.ARRAY_BUFFER, this.sponge.positionsFlat(), gl.STATIC_DRAW);
    /* Tell WebGL how to read the buffer and where the data goes */
    gl.vertexAttribPointer(
      this.mengerPosAttribLoc /* Essentially, the destination */,
      4 /* Number of bytes per primitive */,
      gl.FLOAT /* The type of data */,
      false /* Normalize data. Should be false. */,
      4 *
        Float32Array.BYTES_PER_ELEMENT /* Number of bytes to the next element */,
      0 /* Initial offset into buffer */
    );
    /* Tell WebGL to enable to attribute */
    gl.enableVertexAttribArray(this.mengerPosAttribLoc);

    /* Create and setup normals buffer*/
    this.mengerNormAttribLoc = gl.getAttribLocation(
      this.mengerProgram,
      "aNorm"
    );
    this.mengerNormBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mengerNormBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.sponge.normalsFlat(), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      this.mengerNormAttribLoc,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(this.mengerNormAttribLoc);

    /* Create and setup index buffer*/
    this.mengerIndexBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mengerIndexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      this.sponge.indicesFlat(),
      gl.STATIC_DRAW
    );

    /* End VAO recording */
    this.extVAO.bindVertexArrayOES(this.mengerVAO);

    /* Get uniform locations */
    this.mengerWorldUniformLocation = gl.getUniformLocation(
      this.mengerProgram,
      "mWorld"
    ) as WebGLUniformLocation;
    this.mengerViewUniformLocation = gl.getUniformLocation(
      this.mengerProgram,
      "mView"
    ) as WebGLUniformLocation;
    this.mengerProjUniformLocation = gl.getUniformLocation(
      this.mengerProgram,
      "mProj"
    ) as WebGLUniformLocation;
    this.mengerLightUniformLocation = gl.getUniformLocation(
      this.mengerProgram,
      "lightPosition"
    ) as WebGLUniformLocation;

    /* Bind uniforms */
    gl.uniformMatrix4fv(
      this.mengerWorldUniformLocation,
      false,
      new Float32Array(this.sponge.uMatrix().all())
    );
    gl.uniformMatrix4fv(
      this.mengerViewUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniformMatrix4fv(
      this.mengerProjUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniform4fv(this.mengerLightUniformLocation, this.lightPosition.xyzw);
  }

  /**
   * Sets up the floor and floor drawing
   */
  public initFloor(): void {
    // TODO: your code to set up the floor rendering
    
    /* Alias context for syntactic convenience */
    const gl: WebGLRenderingContext = this.ctx;

    /* Compile Shaders */
    this.floorProgram = WebGLUtilities.createProgram(
      gl,
      floorVSText,
      floorFSText
    );
    gl.useProgram(this.floorProgram);

    /* Create VAO for Menger Sponge */
    this.floorVAO = this.extVAO.createVertexArrayOES() as WebGLVertexArrayObjectOES;
    this.extVAO.bindVertexArrayOES(this.floorVAO);

    /* Create and setup positions buffer*/
    // Returns a number that indicates where 'vertPosition' is in the shader program
    this.floorPosAttribLoc = gl.getAttribLocation(
      this.floorProgram,
      "vertPosition"
    );
    /* Ask WebGL to create a buffer */
    this.floorPosBuffer = gl.createBuffer() as WebGLBuffer;
    /* Tell WebGL that you are operating on this buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.floorPosBuffer);
    /* Fill the buffer with data */
    /*
      (-10,-10)                         (10,-10)
           2                                 1  


          3                                 4
      (-10,10)                           (10,10)

      1,2,3

      4,1,3
    */
    gl.bufferData(gl.ARRAY_BUFFER, 
      new Float32Array(
        [1000.0, -2.0, -1000.0, 1.0, 
        -1000.0, -2.0, -1000.0, 1.0,
        -1000.0, -2.0, 1000.0, 1.0,
        1000.0, -2.0, 1000.0, 1.0,
                      ])
    , gl.STATIC_DRAW);
    /* Tell WebGL how to read the buffer and where the data goes */
    gl.vertexAttribPointer(
      this.floorPosAttribLoc /* Essentially, the destination */,
      4 /* Number of bytes per primitive */,
      gl.FLOAT /* The type of data */,
      false /* Normalize data. Should be false. */,
      4 *
        Float32Array.BYTES_PER_ELEMENT /* Number of bytes to the next element */,
      0 /* Initial offset into buffer */
    );
    /* Tell WebGL to enable to attribute */
    gl.enableVertexAttribArray(this.floorPosAttribLoc);

    /* Create and setup normals buffer*/
    this.floorNormAttribLoc = gl.getAttribLocation(
      this.floorProgram,
      "aNorm"
    );
    this.floorNormBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.floorNormBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 
      new Float32Array(
      [
        0.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
      ])
      , gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      this.floorNormAttribLoc,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(this.floorNormAttribLoc);

    /* Create and setup index buffer*/
    this.floorIndexBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.floorIndexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint32Array([0,1,2,3,0,2]),
      gl.STATIC_DRAW
    );

    /* End VAO recording */
    this.extVAO.bindVertexArrayOES(this.floorVAO);

    /* Get uniform locations */
    this.floorWorldUniformLocation = gl.getUniformLocation(
      this.floorProgram,
      "mWorld"
    ) as WebGLUniformLocation;
    this.floorViewUniformLocation = gl.getUniformLocation(
      this.floorProgram,
      "mView"
    ) as WebGLUniformLocation;
    this.floorProjUniformLocation = gl.getUniformLocation(
      this.floorProgram,
      "mProj"
    ) as WebGLUniformLocation;
    this.floorLightUniformLocation = gl.getUniformLocation(
      this.floorProgram,
      "lightPosition"
    ) as WebGLUniformLocation;

    /* Bind uniforms */
    gl.uniformMatrix4fv(
      this.floorWorldUniformLocation,
      false,
      new Float32Array(this.sponge.uMatrix().all())
    );
    gl.uniformMatrix4fv(
      this.floorViewUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniformMatrix4fv(
      this.floorProjUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniform4fv(this.floorLightUniformLocation, this.lightPosition.xyzw);
  }

  /**
   * Sets up the floor and floor drawing
   */
  public initTerrain(): void {
    // TODO: your code to set up the floor rendering
    
    /* Alias context for syntactic convenience */
    const gl: WebGLRenderingContext = this.ctx;

    /* Compile Shaders */
    this.terrainProgram = WebGLUtilities.createProgram(
      gl,
      terrainVSText,
      terrainFSText
    );
    gl.useProgram(this.terrainProgram);

    /* Create VAO for Menger Sponge */
    this.terrainVAO = this.extVAO.createVertexArrayOES() as WebGLVertexArrayObjectOES;
    this.extVAO.bindVertexArrayOES(this.terrainVAO);

    /* Create and setup positions buffer*/
    // Returns a number that indicates where 'vertPosition' is in the shader program
    this.terrainPosAttribLoc = gl.getAttribLocation(
      this.terrainProgram,
      "vertPosition"
    );
    /* Ask WebGL to create a buffer */
    this.terrainPosBuffer = gl.createBuffer() as WebGLBuffer;
    /* Tell WebGL that you are operating on this buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.terrainPosBuffer);
    /* Fill the buffer with data */
    /*
      (-10,-10)                         (10,-10)
           2                                 1  


          3                                 4
      (-10,10)                           (10,10)

      1,2,3

      4,1,3
    */
    gl.bufferData(gl.ARRAY_BUFFER, 
      this.terrain.positionsFlat(),
      gl.STATIC_DRAW);
    /* Tell WebGL how to read the buffer and where the data goes */
    gl.vertexAttribPointer(
      this.terrainPosAttribLoc /* Essentially, the destination */,
      4 /* Number of bytes per primitive */,
      gl.FLOAT /* The type of data */,
      false /* Normalize data. Should be false. */,
      4 *
        Float32Array.BYTES_PER_ELEMENT /* Number of bytes to the next element */,
      0 /* Initial offset into buffer */
    );
    /* Tell WebGL to enable to attribute */
    gl.enableVertexAttribArray(this.terrainPosAttribLoc);

    /* Create and setup normals buffer*/
    this.terrainNormAttribLoc = gl.getAttribLocation(
      this.terrainProgram,
      "aNorm"
    );
    this.terrainNormBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.terrainNormBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.terrain.normalsFlat(), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      this.terrainNormAttribLoc,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(this.terrainNormAttribLoc);

    /* Create and setup index buffer*/
    this.terrainIndexBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.terrainIndexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      this.terrain.indicesFlat(),
      gl.STATIC_DRAW
    );

    /* End VAO recording */
    this.extVAO.bindVertexArrayOES(this.terrainVAO);

    /* Get uniform locations */
    this.terrainWorldUniformLocation = gl.getUniformLocation(
      this.terrainProgram,
      "mWorld"
    ) as WebGLUniformLocation;
    this.terrainViewUniformLocation = gl.getUniformLocation(
      this.terrainProgram,
      "mView"
    ) as WebGLUniformLocation;
    this.terrainProjUniformLocation = gl.getUniformLocation(
      this.terrainProgram,
      "mProj"
    ) as WebGLUniformLocation;
    this.terrainLightUniformLocation = gl.getUniformLocation(
      this.terrainProgram,
      "lightPosition"
    ) as WebGLUniformLocation;

    /* Bind uniforms */
    gl.uniformMatrix4fv(
      this.terrainWorldUniformLocation,
      false,
      new Float32Array(this.terrain.uMatrix().all())
    );
    gl.uniformMatrix4fv(
      this.terrainViewUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniformMatrix4fv(
      this.terrainProjUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniform4fv(this.terrainLightUniformLocation, this.lightPosition.xyzw);
  }


  /**
   * Draws a single frame
   */
  public draw(): void {

    const gl: WebGLRenderingContext = this.ctx;

    /* Clear canvas */
    const bg: Vec4 = this.backgroundColor;
    gl.clearColor(bg.r, bg.g, bg.b, bg.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    /* Menger - Update/Draw */
    const modelMatrix = this.sponge.uMatrix();
    gl.useProgram(this.mengerProgram);

    this.extVAO.bindVertexArrayOES(this.mengerVAO);

    /* Update menger buffers */
    if (this.sponge.isDirty()) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.mengerPosBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        this.sponge.positionsFlat(),
        gl.STATIC_DRAW
      );
      gl.vertexAttribPointer(
        this.mengerPosAttribLoc,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.enableVertexAttribArray(this.mengerPosAttribLoc);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.mengerNormBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.sponge.normalsFlat(), gl.STATIC_DRAW);
      gl.vertexAttribPointer(
        this.mengerNormAttribLoc,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.enableVertexAttribArray(this.mengerNormAttribLoc);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mengerIndexBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        this.sponge.indicesFlat(),
        gl.STATIC_DRAW
      );

      this.sponge.setClean();
    }

    /* Update menger uniforms */
    gl.uniformMatrix4fv(
      this.mengerWorldUniformLocation,
      false,
      new Float32Array(modelMatrix.all())
    );
    gl.uniformMatrix4fv(
      this.mengerViewUniformLocation,
      false,
      new Float32Array(this.gui.viewMatrix().all())
    );
    gl.uniformMatrix4fv(
      this.mengerProjUniformLocation,
      false,
      new Float32Array(this.gui.projMatrix().all())
    );
	
	console.log("Drawing ", this.sponge.indicesFlat().length, " triangles");


    /* Draw menger */
    gl.drawElements(
      gl.TRIANGLES,
      this.sponge.indicesFlat().length,
      gl.UNSIGNED_INT,
      0
    );
    
    if(this.DRAW_TERRAIN){
      gl.useProgram(this.terrainProgram);
      this.extVAO.bindVertexArrayOES(this.terrainVAO);

      gl.uniformMatrix4fv(
        this.terrainWorldUniformLocation,
        false,
        new Float32Array(modelMatrix.all())
      );
      gl.uniformMatrix4fv(
        this.terrainViewUniformLocation,
        false,
        new Float32Array(this.gui.viewMatrix().all())
      );
      gl.uniformMatrix4fv(
        this.terrainProjUniformLocation,
        false,
        new Float32Array(this.gui.projMatrix().all())
      );
      
      gl.drawElements(
        gl.TRIANGLES,
        this.terrain.indicesFlat().length,
        gl.UNSIGNED_INT,
        0
      );
      //console.log("Drawing terrain?")
    }
    else{
      gl.useProgram(this.floorProgram);
      this.extVAO.bindVertexArrayOES(this.floorVAO);

      gl.uniformMatrix4fv(
        this.floorWorldUniformLocation,
        false,
        new Float32Array(modelMatrix.all())
      );
      gl.uniformMatrix4fv(
        this.floorViewUniformLocation,
        false,
        new Float32Array(this.gui.viewMatrix().all())
      );
      gl.uniformMatrix4fv(
        this.floorProjUniformLocation,
        false,
        new Float32Array(this.gui.projMatrix().all())
      );
      
      gl.drawElements(
        gl.TRIANGLES,
        6,
        gl.UNSIGNED_INT,
        0
      );
      // TODO: draw the floor
    }

   
    
  }

  public setLevel(level: number): void {
    this.sponge.setLevel(level);
  }

  public getGUI(): GUI {
    return this.gui;
  }
}

export function initializeCanvas(): void {
  const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
  /* Start drawing */
  const canvasAnimation: MengerAnimation = new MengerAnimation(canvas);
  mengerTests.registerDeps(canvasAnimation);
  mengerTests.registerDeps(canvasAnimation);
  canvasAnimation.start();
}
