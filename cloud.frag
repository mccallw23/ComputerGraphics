#version 330 core

layout (std140) uniform camera
{
	mat4 projection;
	mat4 view;
	mat4 pvm;
	mat4 ortho;
	vec4 position;
};

/*uniform variables*/
uniform float iTime;					////time

/*input variables*/
in vec3 vtx_pos;

/*input variables*/
out vec4 frag_color;

///////////// Part 1a /////////////////////
/* Create a function that takes in an xy coordinate and returns a 'random' 2d vector. (There is no right answer)
   Feel free to find a hash function online. Use the commented function to check your result */
vec2 hash2(vec2 v)
{
	vec2 rand = vec2(0,0);
	
	// Your implementation starts here

	rand  = 50.0* 1.05 * fract(v * 0.3183099 + vec2(0.71, 0.113));
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

// float noiseOctaveWater(vec2 v, int num)
// {
// 	float sum = 0;

// 	// Your implementation starts here
// 	for ( int i=0; i<num; i++) {
// 		float w = pow(1.0, -i);
// 		float s = pow(1.0, i);

// 		float noise_indv = w*perlin_noise(vec2(s*v.x, s*v.y));
// 		sum = sum + noise_indv;
// 	}
// 	// Your implementation ends here

// 	return sum;
// }

///////////// Part 2a /////////////////////
/* create a function that takes in a 2D point and returns a height using perlin noise 
    There is no right answer. Think about what functions will create what shapes.
    If you want steep mountains with flat tops, use a function like sqrt(noiseOctave(v,num)). 
    If you want jagged mountains, use a function like e^(noiseOctave(v,num))
    You can also add functions on top of each other and change the frequency of the noise
    by multiplying v by some value other than 1*/
float height(vec2 p){
	float h=0;
    h = sin(p.x*.1+p.y*.2)+sin(p.y*.1-p.x*.2);
    h += sin(p.x*.04+p.y*.01+3.0)*4.;
    h -= sin(h*10.0)*.1;
	h=h+20*sin(iTime);

	// h=0.75*noiseOctave(v,10);
	// Your implementation ends here

	return h;
}

///////////// Part 2b /////////////////////
/* compute the normal vector at v by find the points d to the left/right and d forward/backward 
    and using a cross product. Be sure to normalize the result */
vec3 compute_normal(vec2 v, float d)
{	
	vec3 normal_vector = vec3(0,0,0);
	// Your implementation starts here
	vec3 v1 = vec3(v.x+d, v.y, height(vec2(v.x+d,v.y)));
	vec3 v2 = vec3(v.x-d, v.y, height(vec2(v.x-d,v.y)));
	vec3 v3 = vec3(v.x, v.y+d, height(vec2(v.x,v.y+d)));
	vec3 v4 = vec3(v.x, v.y-d, height(vec2(v.x,v.y-d)));

	normal_vector=normalize(cross(v2-v1, v4-v3));
	// Your implementation ends here
	return normal_vector;
}

///////////// Part 2c /////////////////////
/* complete the get_color function by setting emissiveColor using some function of height/normal vector/noise */
/* put your Phong/Lambertian lighting model here to synthesize the lighting effect onto the terrain*/
vec3 get_color(vec2 v)
{
	vec3 vtx_normal = compute_normal(v, 1.0);
	vec3 emissiveColor = vec3(0,0,0);
	vec3 lightingColor= vec3(1.,1.,1.);

	// Your implementation starts here
	// if(noiseOctave(v,10)<0.0){
	// 	emissiveColor = mix(vec3(0.8,0.6,0.7), vec3(0.7,0.6,0.9), height(v));	
	// }
	// else{
		emissiveColor = mix(vec3(1.0,1.0,1.0), vec3(1.0,1.0,1.0), height(v));
	// }
	/*This part is the same as your previous assignment. Here we provide a default parameter set for the hard-coded lighting environment. Feel free to change them.*/
	const vec3 LightPosition = vec3(0, 0, 110);
	const vec3 LightIntensity = vec3(20);
	const vec3 ka = 300*vec3(1., 1., 1.);
	const vec3 kd = 0.7*vec3(1., 1., 1.);
	const vec3 ks = vec3(2.);
	const float n = 400.0;

	vec3 normal = normalize(vtx_normal.xyz);
	vec3 lightDir = LightPosition - vtx_pos *0.0;
	float _lightDist = length(lightDir);
	vec3 _lightDir = normalize(lightDir);
	vec3 _localLight = LightIntensity / (_lightDist * _lightDist);
	vec3 ambColor = ka;
	lightingColor = kd * _localLight * max(0., dot(_lightDir, normal));

	// Your implementation ends here

    return ambColor*emissiveColor*lightingColor;


}

void main()
{
	frag_color = vec4(get_color(vtx_pos.xy),1.f);
}