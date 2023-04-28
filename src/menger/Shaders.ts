export let defaultVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    attribute vec4 aNorm;
    
    varying vec4 lightDir;
    varying vec4 normal;   
    varying vec3 pos;
    varying float u_time;

    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
	uniform mat4 mProj;

    uniform float time;

    void main () {
        u_time = time;
		//  Convert vertex to camera coordinates and the NDC
        gl_Position = mProj * mView * mWorld * vec4 (vertPosition, 1.0);
        pos = vertPosition;
        //  Compute light direction (world coordinates)
        lightDir = lightPosition - vec4(vertPosition, 1.0);
		
        //  Pass along the vertex normal (world coordinates)
        normal = aNorm;
    }
`;

// TODO: Write the fragment shader

export let defaultFSText = `
    precision mediump float;
 
	varying vec3 pos;
    varying float u_time;
    
    #define PI 3.1415925359
    #define TWO_PI 6.2831852
    #define MAX_STEPS 100 // Max steps
    #define MAX_DIST 1000. // Max distance
    #define SURF_DIST .001 // Surface distance for intersection
    
    vec3 hitColor = vec3(1,1,1);
    vec3 lastHitColor = vec3(1,1,1);

    float sphereSDF(vec3 p, float r) {
        return length(p) - r;
    }

    float cubeSDF(vec3 p) {
        // If d.x < 0, then -1 < p.x < 1, and same logic applies to p.y, p.z
        // So if all components of d are negative, then p is inside the unit cube
        vec3 d = abs(p) - vec3(1.0, 1.0, 1.0);
        
        // Assuming p is inside the cube, how far is it from the surface?
        // Result will be negative or zero.
        float insideDistance = min(max(d.x, max(d.y, d.z)), 0.0);
        
        // Assuming p is outside the cube, how far is it from the surface?
        // Result will be positive or zero.
        float outsideDistance = length(max(d, 0.0));
        
        return insideDistance + outsideDistance;
    }

    float GetDist(vec3 p) 
    {
        vec4 s = vec4(0,1,6,1); //Sphere xyz is position w is radius
        float planeDist  = p.y;
        //float displacement = sin(5.0 * p.x) * sin(5.0 * p.y) * sin(5.0 * p.z) * 0.1;
        float sphereDist = length(p-s.xyz) - s.w;
        float d = min(sphereDist,planeDist);
        
        if(sphereDist < planeDist){
            lastHitColor = vec3(1,0,1);
        }
        else{
            lastHitColor = vec3(1,1,1);
        }
        return d;
    }
    
    float RayMarch(vec3 origin, vec3 direction) 
    {
        float marchDist = 0.0; //Distane Origin
        for(int i=0; i<MAX_STEPS; i++)
        {
            vec3 p = origin + direction * marchDist;
            float ds = GetDist(p);
            marchDist += ds;
            //if ray goes off into space, or hits object, return
            if(marchDist > MAX_DIST){
                break;
            }
            if(ds < SURF_DIST){
                hitColor = lastHitColor;
                break;
            }
        }
        return marchDist;
    }
    
    vec3 GetNormal(vec3 p)
    { 
        float d = GetDist(p); // Distance
        vec2 e = vec2(.01,0); // Epsilon
        vec3 n = d - vec3(
        GetDist(p-e.xyy),
        GetDist(p-e.yxy),
        GetDist(p-e.yyx));
    
        return normalize(n);
    }

    float GetLight(vec3 p)
    { 
        // Directional light
        vec3 lightPos = vec3(5.*sin(u_time),5.,5.0*cos(u_time)); // rotating light pos
        vec3 l = normalize(lightPos-p); // Light Vector
        vec3 n = GetNormal(p); // Normal Vector
    
        float dif = dot(n,l); // Diffuse light
        dif = clamp(dif,0.,1.); // Clamp so it doesnt go below 0
    
        // Shadows
        float d = RayMarch(p+n*SURF_DIST*2., l); 
        
        if(d < length(lightPos-p)){
            dif *= .1;
        } 
    
        return dif;
    }
    
    void main()
    {
        float u = pos.x;
        float v = pos.y;
        vec2 uv = vec2(u,v);
        vec3 ro = vec3(0,1,0); // Ray Origin
        vec3 rd = normalize(vec3(uv.x,uv.y,1)); // Ray Direction
    
        float d = RayMarch(ro,rd); // Distance
        
        vec3 color = vec3(0.0,0.0,0.0);

        if(d <= MAX_DIST){
            vec3 p = ro + rd * d;
            float dif = GetLight(p); // Diffuse lighting
            color = vec3(dif) * hitColor;
        }
        
        // Set the output color
        gl_FragColor = vec4(color,1.0);
    }

`;

// TODO: floor shaders

export let floorVSText = ``;
export let floorFSText = ``;

