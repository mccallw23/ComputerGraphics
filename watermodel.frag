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

	float frequency = 1.0;
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
    float h = 0;
	// Your implementation starts here
	// use a combination of sqrt, pow and abs on top of one another using noiseOctave(k  *  v,  n),
	// Your implementation ends here
	h = noiseOctave(v,10);
	h *= .15;
	
	// if (h < 0)
	// {
	// 	h *= 0.05 + .95 * noiseOctave(v, 5);
	// }
	// Your implementation ends here
	return h * cos(iTime) * 1;
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

///////////// Part 2c /////////////////////
/* complete the get_color function by setting emissiveColor using some function of height/normal vector/noise */
/* put your Phong/Lambertian lighting model here to synthesize the lighting effect onto the terrain*/
vec3 get_color(vec2 v)
{
	vec3 vtx_normal = compute_normal(v, 0.01);
	vec3 emissiveColor = vec3(1,0,1);
	vec3 lightingColor= vec3(1.,1.,1.);

	// Your implementation starts here
	
	/*This part is the same as your previous assignment. Here we provide a default parameter set for the hard-coded lighting environment. Feel free to change them.*/
	const vec3 LightPosition = vec3(3, 1, 3);
	const vec3 LightIntensity = vec3(20);
	const vec3 ka = 0.1*vec3(1., 1., 1.);
	const vec3 kd = 0.7*vec3(1., 1., 1.);
	const vec3 ks = vec3(2.);
	const float n = 400.0;

	vec3 normal = normalize(vtx_normal.xyz);
	vec3 lightDir = LightPosition - vtx_pos;
	float _lightDist = length(lightDir);
	vec3 _lightDir = normalize(lightDir);
	vec3 _localLight = LightIntensity / (_lightDist * _lightDist);
	vec3 ambColor = ka;
	lightingColor = kd * _localLight * max(0., dot(_lightDir, normal));

// if height is below 0, set the emissive color to blue (water)
// otherwise set the emissive color to an interpolated value between green and brown based on surface normal and height
	// if(height(v) <= 0)
	// {
	// 	emissiveColor = vec3(0,0,1);
	// }
	// // use the surface normal and height to set the emissive color to an interpolated value between green and brown
	// else
	// {

	// 	// if the gradient is close to flat, set the emissive color to white
	// 	vec3 slope = compute_gradient(v, 0.01);
	// 	if(abs(slope.x) < 0.5 && abs(slope.y) < 0.5 && height(v) > 0.1)
	// 	{
	// 		emissiveColor = vec3(.9,.9,.9);
	// 	}
	// 	else
	// 	{
	// 		// linear interpolation between black (0) and white (1)
	// 	float h = height(v);
	// 	vec3 grass = vec3(.33,.48,.27);
	// 	vec3 dirt = vec3(.6,.46,.32);
	// 	//linear interpolation between grass green (height = 0) and dirt brown (height = .5)

	// 	emissiveColor = grass + (dirt - grass) * 6 * h;

	// 	}
	// }

	if (height(v) < 1)
	{
		emissiveColor = vec3(0,0,1);
	}
	if(height(v) < .05)
	{
		emissiveColor = vec3(0,0,1);
	}
	// vec3 slope = compute_gradient(v, 0.01);
	// if(abs(slope.x) < 0.1 && abs(slope.y) < 0.1 && height(v) > 0)
	// {
	// 	emissiveColor = vec3(.9,.9,.9);
	// }

	// Your implementation ends here

    return emissiveColor*lightingColor;


}

void main()
{
	frag_color = vec4(get_color(vtx_pos.xy),1.f);
}