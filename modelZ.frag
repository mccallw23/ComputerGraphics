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
uniform float iTime;			////time

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
	rand  = 50.0 * 1.05 * fract(v * 0.3183099 + vec2(0.71, 0.113));
    rand = -1.0 + 2 * 1.05 * fract(rand.x * rand.y * (rand.x + rand.y) * rand);
	// Your implementation ends here

	return rand;
}
///////////// Part 1b /////////////////////
/*  Using i, f, and m, compute the perlin noise at point v */
float perlin_noise(vec2 v) 
{

// 	Given a 2D vector v, return the Perlin noise value 
// at v. You may use 3 calls of mix and 4 dot products
	float noise = 0;
	// Your implementation starts here

	vec2 i = floor(v);
	vec2 f = fract(v);
	vec2 m = f * f * (3.0 - 2.0 * f);
	vec2 a = hash2(i + vec2(0,0));
	vec2 b = hash2(i + vec2(1,0));
	vec2 c = hash2(i + vec2(0,1));
	vec2 d = hash2(i + vec2(1,1));
	noise = mix(mix(dot(a, f - vec2(0,0)), dot(b, f - vec2(1,0)), m.x),
				mix(dot(c, f - vec2(0,1)), dot(d, f - vec2(1,1)), m.x), m.y);

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

	float frequency = .05;
	float amplitude = 1.0;
	float max = 0.0;
	for (int i = 0; i < num; i++) {
		sum += amplitude * perlin_noise(frequency * v);
		max += amplitude;
		amplitude *= 0.5;
		frequency *= 2.0;
	}
	sum /= max;
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
float height(vec2 v){
    // float h = 0;
	// // Your implementation starts here
	// // use a combination of sqrt, pow and abs on top of one another using noiseOctave(k  *  v,  n),
	// // Your implementation ends here
	// h = noiseOctave(v,10);
	// h *= .15;
	
	// // if (h < 0)
	// // {
	// // 	h *= 0.05 + .95 * noiseOctave(v, 5);
	// // }
	// // Your implementation ends here
	// return h * cos(iTime) * 1;

	float h = 0;
    float t = iTime * 0.1; // adjust the time scale here
    float frequency = .05;
    float amplitude = 1.;
    for (int i = 0; i < 8; i++) { // adjust the number of octaves here
        h += amplitude * perlin_noise(vec2(v.x * frequency, v.y * frequency) + vec2(t, t));
        amplitude *= 0.5;
        frequency *= 2.0;
    }
	//h = sin(v.x * 20.0 + sin(iTime * 2) * 5) * 0.1 + h; // add some periodic variation
  	h = sin(v.x + iTime * 5) * 0.1 + h; // add some periodic variation
    return h;
}

///////////// Part 2b /////////////////////
/* compute the normal vector at v by find the points d to the left/right and d forward/backward 
    and using a cross product. Be sure to normalize the result */
vec3 compute_normal(vec2 v, float d)
{	
	vec3 normal_vector = vec3(0,0,0);
	// Your implementation starts here

	vec3 left = vec3(v.x + d, v.y, height(vec2(v.x + d, v.y)));    
	vec3 right = vec3(v.x - d, v.y, height(vec2(v.x - d, v.y)));
	vec3 forward = vec3(v.x, v.y + d, height(vec2(v.x, v.y + d)));
	vec3 backward = vec3(v.x, v.y - d, height(vec2(v.x, v.y - d)));

	normal_vector = normalize(cross(left - right, forward - backward));

	// Your implementation ends here
	return normal_vector;
}

// compute the gradient at v by find the points d to the left/right and d forward/backward

vec3 compute_gradient(vec2 v, float d)
{	
	vec3 gradient = vec3(0,0,0);
	// Your implementation starts here
	// ensure value is always positive and constrained to [0,1]

	gradient = vec3(height(vec2(v.x + d, v.y)) - height(vec2(v.x - d, v.y)), height(vec2(v.x, v.y + d)) - height(vec2(v.x, v.y - d)), 2 * d);
	gradient = normalize(gradient);

	return gradient;
}

vec3 rotate(vec3 v, vec3 axis, float angle)
{
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	return vec3(
		(axis.x * axis.x * oc + c) * v.x + (axis.x * axis.y * oc - axis.z * s) * v.y + (axis.x * axis.z * oc + axis.y * s) * v.z,
		(axis.y * axis.x * oc + axis.z * s) * v.x + (axis.y * axis.y * oc + c) * v.y + (axis.y * axis.z * oc - axis.x * s) * v.z,
		(axis.z * axis.x * oc - axis.y * s) * v.x + (axis.z * axis.y * oc + axis.x * s) * v.y + (axis.z * axis.z * oc + c) * v.z);
}

///////////// Part 2c /////////////////////
/* complete the get_color function by setting emissiveColor using some function of height/normal vector/noise */
/* put your Phong/Lambertian lighting model here to synthesize the lighting effect onto the terrain*/
vec3 get_color(vec2 v)
{

float ambientStrength = 0.1;
float diffuseStrength = 0.9;
float specularStrength = 0.5;
float shininess = 32.0;

	vec3 vtx_normal = compute_normal(v, 0.01);
	vec3 emissiveColor = vec3(1,0,1);
	vec3 lightingColor= vec3(1.,1.,1.);

	// Your implementation starts here
	//float posY = cos(iTime) * 10;
	/*This part is the same as your previous assignment. Here we provide a default parameter set for the hard-coded lighting environment. Feel free to change them.*/
	vec3 LightPosition = vec3(-10, 30, 0);
	const vec3 LightIntensity = vec3(3000);
	const vec3 ka = 0.1*vec3(1., 1., 1.);
	const vec3 kd = 0.7*vec3(1., 1., 1.);
	const vec3 ks = vec3(2.);
	const float n = 400.0;

	vec3 normal = normalize(vtx_normal.xzy);
	vec3 lightDir = LightPosition - vtx_pos;
	float _lightDist = length(lightDir);
	vec3 _lightDir = normalize(lightDir);
	vec3 _localLight = LightIntensity / (_lightDist * _lightDist);
	vec3 ambColor = ka;
	lightingColor = kd * _localLight * max(0., dot(_lightDir, normal));

	vec3 viewDir = normalize(position.xyz - vtx_pos);
	vec3 halfDir = normalize(_lightDir + viewDir);
	lightingColor += ks * _localLight * pow(max(0., dot(normal, halfDir)), shininess);

	vec3 fireFlyLightPosition = vec3(20,5,5);
	const vec3 FireFlyLightIntensity = vec3(50,50,50);
	vec3 fireFlyLightDir = fireFlyLightPosition - vtx_pos;
	float _fireFlyLightDist = length(fireFlyLightDir);
	vec3 _fireFlyLightDir = normalize(fireFlyLightDir);
	vec3 _fireFlyLocalLight = FireFlyLightIntensity / (_fireFlyLightDist * _fireFlyLightDist);
	//green firefly
	vec3 fireFlyColor = vec3(1,1,1);
	lightingColor += fireFlyColor * _fireFlyLocalLight * max(0., dot(_fireFlyLightDir, normal));
	lightingColor += fireFlyColor * _fireFlyLocalLight * pow(max(0., dot(normal, halfDir)), shininess);


	if (height(v) < 1)
	{
		emissiveColor = vec3(.168,.396,.925);
	}
	if(height(v) < .05)
	{
		emissiveColor = vec3(.168,.396,.925);
	}
	emissiveColor = vec3(.168,.396,.925);

    return emissiveColor*lightingColor;


}

void main()
{
	// make the mesh semi-transparent
	// compute rotated vertex position
	vec3 newVertex = rotate(vtx_pos, vec3(0,1,0), .2 * iTime);
	frag_color = vec4(get_color(newVertex.xz), 0);
}