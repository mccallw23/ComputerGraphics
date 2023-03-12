#version 330 core

// Add parts 1a-c first, then implement part 2a

layout (std140) uniform camera
{
	mat4 projection;
	mat4 view;
	mat4 pvm;
	mat4 ortho;
	vec4 position;
};

///////////// Part 1a /////////////////////
/* Create a function that takes in an xy coordinate and returns a 'random' 2d vector. (There is no right answer)
   Feel free to find a hash function online. Use the commented function to check your result */
vec2 hash2(vec2 v)
{
	vec2 rand = vec2(0,0);
	
	// Your implementation starts here
	
	rand  = 50.0 * 1.05 * fract(v * 0.3183099 + vec2(0.71, 0.113));
    rand = -1.0 + 2 * 1.05 * fract(rand.x * rand.y * (rand.x + rand.y) * rand);

	// Your implementation ends here

	return rand;
}

///////////// Part 1b /////////////////////
/*  Using i, f, and m, compute the perlin noise at point v */
float perlin_noise(vec2 v) 
{
	float noise = 0;
	// Your implementation starts here
	vec2 i = floor(v);
	vec2 f = fract(v);

	vec2 m = f*f*(3.0-2.0*f);

	float a = mix( dot( hash2( i+ivec2(0,0) ), f-vec2(0.0,0.0) ), 
				   dot( hash2( i+ivec2(1,0) ), f-vec2(1.0,0.0) ), m.x);
	float b = mix( dot( hash2( i+ivec2(0,1) ), f-vec2(0.0,1.0) ), 
				   dot( hash2( i+ivec2(1,1) ), f-vec2(1.0,1.0) ), m.x);

	noise = mix(a, b, m.y);

	// Your implementation ends here
	return noise;
}

///////////// Part 1c /////////////////////
/*  Given a point v and an int num, compute the perlin noise octave for point v with octave num
	num will be greater than 0 */
float noiseOctave(vec2 v, int num)
{
	float sum = 0;

	// Your implementation starts here
	for ( int i=0; i<num; i++) {
		float w = pow(2.0, -i);
		float s = pow(2.0, i);

		float noise_indv = w*perlin_noise(vec2(s*v.x, s*v.y));
		sum = sum + noise_indv;
	}
	// Your implementation ends here

	return sum;
}

///////////// Part 2a /////////////////////
/* create a function that takes in a 2D point and returns a height using perlin noise 
    There is no right answer. Think about what functions will create what shapes.
    If you want steep mountains with flat tops, use a function like sqrt(noiseOctave(v,num)). 
    If you want jagged mountains, use a function like e^(noiseOctave(v,num))
    You can also add functions on top of each other and change the frequency of the noise
    by multiplying v by some value other than 1*/
float height(vec2 p){
    float h = 0;
    h = sin(p.x*.1+p.y*.2)+sin(p.y*.1-p.x*.2);
    h += sin(p.x*.04+p.y*.01+3.0)*4.;
    h -= sin(h*10.0)*.0;
	// h=sqrt(h)+10;
    return h;
}

/*uniform variables*/
uniform float iTime;					////time

/*input variables*/
layout (location=0) in vec4 pos;
layout (location=2) in vec4 normal;
layout (location=3) in vec4 uv;
layout (location=4) in vec4 tangent;

/*output variables*/
out vec3 vtx_pos;		////vertex position in the world space

void main()												
{
	vtx_pos = vec3(10,40,0)+(vec4(pos.xz, height(pos.xz), 1)).xzy;
	gl_Position = pvm * vec4(vtx_pos,1.0);
}