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
    #define SURF_DIST .01 // Surface distance for intersection
    
    vec3 hitColor = vec3(1,1,1);
    vec3 lastHitColor = vec3(1,1,1);

    float sphereSDF(vec3 p, float r) {
        return length(p) - r;
    }

    //t = {initial radius, revolving radius}
    float torusSDF( vec3 p, vec2 t )
    {
        return length(vec2(length(p.xz)-t.x,p.y))-t.y;
    }

    //function to generate rotation matrix given an angle
    mat2 Rot(float a){
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
    }
    float getPlaneOffset(vec3 p){
        p *= 5.0;
        return abs(dot(sin(p), cos(p.yzx))) * 0.1;
    }
    float GetDist(vec3 p) 
    {
        //vec4 s = vec4(0,1,6,1); //Sphere xyz is position w is radius
        float planeDist  = p.y + getPlaneOffset(p);
        
        vec3 torusPos = p + vec3(0,-1,-2);
        //rotate torus
        torusPos.xy *= Rot(u_time);
        torusPos.yz *= Rot(u_time);
        float torusDist = torusSDF(torusPos, vec2(0.5,0.1));

        vec3 spherePos = p + vec3(0,-1,-2);
        float sphereDist = sphereSDF(spherePos, 0.5);

        float d = min(torusDist,planeDist);

        // if(sphereDist < planeDist){
        //     lastHitColor = vec3(1,0,1);
        // }
        // else{
        //     lastHitColor = vec3(1,1,1);
        // }
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

