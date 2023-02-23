export let defaultVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    attribute vec4 aNorm;
    
    varying vec4 lightDir;
    varying vec4 normal;   
 
    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
	uniform mat4 mProj;

    void main () {
		//  Convert vertex to camera coordinates and the NDC
        gl_Position = mProj * mView * mWorld * vec4 (vertPosition, 1.0);
        
        //  Compute light direction (world coordinates)
        lightDir = lightPosition - vec4(vertPosition, 1.0);
		
        //  Pass along the vertex normal (world coordinates)
        normal = aNorm;
    }
`;

// TODO: Write the fragment shader

export let defaultFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;
    
    void main () {
        vec4 n = normalize(normal);
        vec4 l = normalize(lightDir);
        float diffuse = abs(dot(n,l));
        
        if(abs(normal.z) == 1.0){
            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        }
        else if(abs(normal.y) == 1.0){
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        }
        else{
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
        gl_FragColor.x *= diffuse;
        gl_FragColor.y *= diffuse;
        gl_FragColor.z *= diffuse;
    }
`;

// TODO: floor shaders

export let floorVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec4 aNorm;

    varying vec4 lightDir;
    varying vec4 normal;   
    varying vec3 texCoord;

    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main () {
        
        //  Convert vertex to camera coordinates and the NDC
        gl_Position = mProj * mView * mWorld * vec4 (vertPosition, 1.0);
        
        //  Compute light direction (world coordinates)
        lightDir = lightPosition - vec4(vertPosition, 1.0);
        
        //  Pass along the vertex normal (world coordinates)
        normal = aNorm;

        texCoord = vertPosition;
    }
`;
export let floorFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;  
    varying vec3 texCoord;

    void main () {
        vec4 n = normalize(normal);
        vec4 l = normalize(lightDir);
        float diffuse = abs(dot(n,l));

        float a = floor(texCoord.x/5.0);
        float b = floor(texCoord.z/5.0);
        float sum = a + b;
        float result = mod(float(sum), 2.0);
        if(result == 0.0){
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
        else{
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
        gl_FragColor.x *= diffuse;
        gl_FragColor.y *= diffuse;
        gl_FragColor.z *= diffuse;
    }
`;

