/*This is your fragment shader for texture and normal mapping*/

#version 330 core

/*default camera matrices. do not modify.*/
layout (std140) uniform camera
{
	mat4 projection;	/*camera's projection matrix*/
	mat4 view;			/*camera's view matrix*/
	mat4 pvm;			/*camera's projection*view*model matrix*/
	mat4 ortho;			/*camera's ortho projection matrix*/
	vec4 position;		/*camera's position in world space*/
};

/*uniform variables*/
uniform float iTime;					////time
uniform sampler2D tex_albedo;			////texture color
uniform sampler2D tex_normal;			////texture normal

/*input variables*/
//// TODO: declare your input variables
in vec2 v_uv;
in vec3 v_pos;
in vec3 v_normal;
in vec3 v_tangent;

/*output variables*/
out vec4 frag_color;

/*This part is the same as your previous assignment. Here we provide a default parameter set for the hard-coded lighting environment. Feel free to change them.*/
const vec3 LightPosition = vec3(1, 3, 1);
const vec3 LightIntensity = vec3(2);
const vec3 ka = 0.8*vec3(1., 1., 1.);
const vec3 kd = 0.2*vec3(1., 1., 1.);
const vec3 ks = vec3(2.);
const float n = 400.0;

void main()							
{		
	bool use_normal_mapping = true;	////TODO: set this flag to be true when you move from Step 2 to Step 3

	float r = 50;
	float PI = 3.14159;

	float x = v_pos[0];
	float y = v_pos[1];
	float z = v_pos[2];

	float theta = atan(y/x);
	if (x<0) {
		theta += PI;
	} else if (y<0) {
		theta += 2*PI;
	}
	float phi = acos(z/r);

	vec2 uv=vec2(theta/(2*PI),phi/PI);
	vec3 v_color = texture(tex_albedo, uv).rgb;

	if(!use_normal_mapping){

		frag_color = vec4(v_color,1.f);
		// ambient
		vec3 ambient = ka * v_color;
		// diffuse
		vec3 l=normalize(LightPosition-v_pos);
		float l_dot_n=dot(l,v_normal);
		float diff=max(0.,l_dot_n);
		vec3 diffuse = diff * kd * v_color;
		frag_color = vec4(ambient,1.f) + vec4(diffuse,1.f);
	}
	else{
		vec3 t_color = texture(tex_albedo, uv).rgb;
		vec3 t_norm = texture(tex_normal, uv).xyz;
		t_norm = normalize(t_norm * 2.0 - 1.0);

		vec3 T = normalize(v_tangent);
		vec3 N = normalize(v_normal);
		vec3 B = normalize(cross(N,T));
		mat3 TBN = mat3(T, B, N);

		t_norm = normalize(TBN * t_norm);

		// ambient
		vec3 ambient = ka * t_color;
		// diffuse
		vec3 l=normalize(LightPosition-v_pos);
		float l_dot_n=dot(l,t_norm);
		float diff=max(0.,l_dot_n);
		vec3 diffuse = diff * kd * t_color;

		frag_color = vec4(ambient,1.f) + vec4(diffuse,1.f);
	}
}