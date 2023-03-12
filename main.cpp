//#####################################################################
// Main
// Dartmouth COSC 77/177 Computer Graphics, starter code
// Contact: Bo Zhu (bo.zhu@dartmouth.edu)
//#####################################################################
#include <iostream>
#include <random>
#include <vector>
#include <algorithm>
#include <unordered_set>
#include "Common.h"
#include "Driver.h"
#include "OpenGLMesh.h"
#include "OpenGLCommon.h"
#include "OpenGLWindow.h"
#include "OpenGLViewer.h"
#include "OpenGLMarkerObjects.h"
#include "TinyObjLoader.h"

#ifndef __Main_cpp__
#define __Main_cpp__

#ifdef __APPLE__
#define CLOCKS_PER_SEC 100000
#endif

class FinalProjectDriver : public Driver, public OpenGLViewer
{using Base=Driver;
	std::vector<OpenGLTriangleMesh*> mesh_object_array;						////mesh objects, every object you put in this array will be rendered.
	clock_t startTime;

public:
	virtual void Initialize()
	{
		draw_bk=false;						////turn off the default background and use the customized one
		draw_axes=true;						////if you don't like the axes, turn them off!
		startTime=clock();
		OpenGLViewer::Initialize();
	}

	void Add_Shaders()
	{
		////format: vertex shader name, fragment shader name, shader name
		OpenGLShaderLibrary::Instance()->Add_Shader_From_File("background.vert","background.frag","background");	

		////SHADOW TODO: uncomment next three lines to import shadow shaders
		OpenGLShaderLibrary::Instance()->Add_Shader_From_File("object_1_shadow.vert","object_1_shadow.frag","object_1_shadow");	
		// OpenGLShaderLibrary::Instance()->Add_Shader_From_File("object_2_shadow.vert","object_2_shadow.frag","object_2_shadow");	
		// OpenGLShaderLibrary::Instance()->Add_Shader_From_File("object_3_shadow.vert","object_3_shadow.frag","object_3_shadow");	

		////SHADOW TODO: comment out next three lines
		OpenGLShaderLibrary::Instance()->Add_Shader_From_File("object_1.vert","object_1.frag","object_1");	
		OpenGLShaderLibrary::Instance()->Add_Shader_From_File("texturing.vert","texturing.frag","texturing");	
		OpenGLShaderLibrary::Instance()->Add_Shader_From_File("object_2.vert","object_2.frag","object_2");	
		OpenGLShaderLibrary::Instance()->Add_Shader_From_File("object_3.vert","object_3.frag","object_3");
		OpenGLShaderLibrary::Instance()->Add_Shader_From_File("skybox.vert", "skybox.frag", "skybox");
		OpenGLShaderLibrary::Instance()->Add_Shader_From_File("cloud.vert", "cloud.frag", "clouds");
		OpenGLShaderLibrary::Instance()->Add_Shader_From_File("water.vert", "water.frag", "water");			
	}

	void Add_Textures()
	{
		////format: image name, texture name
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("earth_albedo.png", "earth_albedo");
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("earth_normal.png", "earth_normal");
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("cobblestone_albedo.jpg", "cobblestone_albedo");		
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("cobblestone_normal.jpg", "cobblestone_normal");
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("bridge_albedo.jpg", "bridge_albedo");		
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("bridge_normal.jpg", "bridge_normal");

		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("moonless.jpeg", "skybox_albedo");		////TODO (Step 4): use a different texture color image here for your own mesh!
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("moonless.jpeg", "skybox_normal");		////TODO (Step 4): use a different texture normal image here for your own mesh!

		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("building_1_albedo.jpg", "building_1_albedo");		////TODO (Step 4): use a different texture color image here for your own mesh!
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("building_1_normal.jpg", "building_1_normal");		////TODO (Step 4): use a different texture normal image here for your own mesh!
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("building_2_albedo.jpg", "building_2_albedo");		////TODO (Step 4): use a different texture color image here for your own mesh!
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("building_2_normal.jpg", "building_2_normal");		////TODO (Step 4): use a different texture normal image here for your own mesh!
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("building_3_albedo.jpg", "building_3_albedo");		////TODO (Step 4): use a different texture color image here for your own mesh!
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("building_3_normal.jpg", "building_3_normal");		////TODO (Step 4): use a different texture normal image here for your own mesh!
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("building_4_albedo.jpg", "building_4_albedo");		////TODO (Step 4): use a different texture color image here for your own mesh!
		OpenGLTextureLibrary::Instance()->Add_Texture_From_File("building_4_normal.jpg", "building_4_normal");		////TODO (Step 4): use a different texture normal image here for your own mesh!

	}

	void Add_Background()
	{
		OpenGLBackground* opengl_background=Add_Interactive_Object<OpenGLBackground>();
		opengl_background->shader_name="background";
		opengl_background->Initialize();
	}

	//this is an example of adding a mesh object read from obj file
	int Add_Obj1()
	{
		auto mesh_obj=Add_Interactive_Object<OpenGLTriangleMesh>();

		////read mesh file
		std::string obj_file_name="bunny.obj";
		Array<std::shared_ptr<TriangleMesh<3> > > meshes;
		Obj::Read_From_Obj_File_Discrete_Triangles(obj_file_name,meshes);
		mesh_obj->mesh=*meshes[0];

		////set up shader
		mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("object_1_shadow"));//Shadow TODO: uncomment this line and comment next line to use shadow shader
		
		//set up texture
		mesh_obj->Add_Texture("tex_albedo", OpenGLTextureLibrary::Get_Texture("earth_albedo"));
		mesh_obj->Add_Texture("tex_normal", OpenGLTextureLibrary::Get_Texture("earth_normal"));
		Set_Polygon_Mode(mesh_obj,PolygonMode::Fill);
		Set_Shading_Mode(mesh_obj,ShadingMode::Shadow);//SHADOW TODO: set Shading Mode to Shadow
		
		////initialize
		mesh_obj->Set_Data_Refreshed();
		mesh_obj->Initialize();	
		mesh_object_array.push_back(mesh_obj);
		return (int)mesh_object_array.size()-1;
	}

	int Add_Platform()
	{
		auto mesh_obj=Add_Interactive_Object<OpenGLTriangleMesh>();

		////read mesh file
		std::string obj_file_name="platform.obj";
		Array<std::shared_ptr<TriangleMesh<3> > > meshes;
		Obj::Read_From_Obj_File_Discrete_Triangles(obj_file_name,meshes);
		mesh_obj->mesh=*meshes[0];

		////set up shader
		// mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("object_1_shadow"));//Shadow TODO: uncomment this line and comment next line to use shadow shader
		mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("texturing"));
		
		//set up texture
		mesh_obj->Add_Texture("tex_albedo", OpenGLTextureLibrary::Get_Texture("cobblestone_albedo"));
		mesh_obj->Add_Texture("tex_normal", OpenGLTextureLibrary::Get_Texture("cobblestone_normal"));
		Set_Polygon_Mode(mesh_obj,PolygonMode::Fill);
		Set_Shading_Mode(mesh_obj,ShadingMode::Texture);//SHADOW TODO: set Shading Mode to Shadow
		
		////initialize
		mesh_obj->Set_Data_Refreshed();
		mesh_obj->Initialize();	
		mesh_object_array.push_back(mesh_obj);
		return (int)mesh_object_array.size()-1;
	}

	////this is an example of adding a spherical mesh object generated analytically
	int Add_Skybox()
	{
		auto mesh_obj=Add_Interactive_Object<OpenGLTriangleMesh>();

		real radius=300.;
		Initialize_Sphere_Mesh(radius,&mesh_obj->mesh,3);		////add a sphere with radius=1. if the obj file name is not specified
		
		////set up shader
		//mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("object_2_shadow"));//Shadow TODO: uncomment this line and comment next line to use shadow shader
		mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("skybox"));
		
		////set up texture
		mesh_obj->Add_Texture("tex_albedo", OpenGLTextureLibrary::Get_Texture("skybox_albedo"));
		mesh_obj->Add_Texture("tex_normal", OpenGLTextureLibrary::Get_Texture("skybox_normal"));
		
		Set_Polygon_Mode(mesh_obj,PolygonMode::Fill);
		Set_Shading_Mode(mesh_obj,ShadingMode::Texture);//SHADOW TODO: Set Shading Mode to Shadow
		
		////initialize
		mesh_obj->Set_Data_Refreshed();
		mesh_obj->Initialize();	
		mesh_object_array.push_back(mesh_obj);
		return (int)mesh_object_array.size()-1;
	}

	int Add_Bridge()
	{
		auto mesh_obj=Add_Interactive_Object<OpenGLTriangleMesh>();

		////read mesh file
		std::string obj_file_name="bridge.obj";
		Array<std::shared_ptr<TriangleMesh<3> > > meshes;
		Obj::Read_From_Obj_File_Discrete_Triangles(obj_file_name,meshes);
		mesh_obj->mesh=*meshes[0];

		////set up shader
		// mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("object_1_shadow"));//Shadow TODO: uncomment this line and comment next line to use shadow shader
		mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("texturing"));
		
		//set up texture
		mesh_obj->Add_Texture("tex_albedo", OpenGLTextureLibrary::Get_Texture("bridge_albedo"));
		mesh_obj->Add_Texture("tex_normal", OpenGLTextureLibrary::Get_Texture("bridge_normal"));
		Set_Polygon_Mode(mesh_obj,PolygonMode::Fill);
		Set_Shading_Mode(mesh_obj,ShadingMode::Texture);//SHADOW TODO: set Shading Mode to Shadow
		
		////initialize
		mesh_obj->Set_Data_Refreshed();
		mesh_obj->Initialize();	
		mesh_object_array.push_back(mesh_obj);
		return (int)mesh_object_array.size()-1;
	}

	int Add_Buildings_1()
	{
		auto mesh_obj=Add_Interactive_Object<OpenGLTriangleMesh>();

		////read mesh file
		std::string obj_file_name="buildings_1.obj";
		Array<std::shared_ptr<TriangleMesh<3> > > meshes;
		Obj::Read_From_Obj_File_Discrete_Triangles(obj_file_name,meshes);
		mesh_obj->mesh=*meshes[0];

		////set up shader
		mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("texturing"));
		
		//set up texture
		mesh_obj->Add_Texture("tex_albedo", OpenGLTextureLibrary::Get_Texture("building_1_albedo"));
		mesh_obj->Add_Texture("tex_normal", OpenGLTextureLibrary::Get_Texture("building_1_normal"));
		Set_Polygon_Mode(mesh_obj,PolygonMode::Fill);
		Set_Shading_Mode(mesh_obj,ShadingMode::Texture);//SHADOW TODO: set Shading Mode to Shadow
		
		////initialize
		mesh_obj->Set_Data_Refreshed();
		mesh_obj->Initialize();	
		mesh_object_array.push_back(mesh_obj);
		return (int)mesh_object_array.size()-1;
	}

	int Add_Buildings_2()
	{
		auto mesh_obj=Add_Interactive_Object<OpenGLTriangleMesh>();

		////read mesh file
		std::string obj_file_name="buildings_2.obj";
		Array<std::shared_ptr<TriangleMesh<3> > > meshes;
		Obj::Read_From_Obj_File_Discrete_Triangles(obj_file_name,meshes);
		mesh_obj->mesh=*meshes[0];

		////set up shader
		mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("texturing"));
		
		//set up texture
		mesh_obj->Add_Texture("tex_albedo", OpenGLTextureLibrary::Get_Texture("building_2_albedo"));
		mesh_obj->Add_Texture("tex_normal", OpenGLTextureLibrary::Get_Texture("building_2_normal"));
		Set_Polygon_Mode(mesh_obj,PolygonMode::Fill);
		Set_Shading_Mode(mesh_obj,ShadingMode::Texture);//SHADOW TODO: set Shading Mode to Shadow
		
		////initialize
		mesh_obj->Set_Data_Refreshed();
		mesh_obj->Initialize();	
		mesh_object_array.push_back(mesh_obj);
		return (int)mesh_object_array.size()-1;
	}

	int Add_Buildings_3()
	{
		auto mesh_obj=Add_Interactive_Object<OpenGLTriangleMesh>();

		////read mesh file
		std::string obj_file_name="buildings_3.obj";
		Array<std::shared_ptr<TriangleMesh<3> > > meshes;
		Obj::Read_From_Obj_File_Discrete_Triangles(obj_file_name,meshes);
		mesh_obj->mesh=*meshes[0];

		////set up shader
		mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("texturing"));
		
		//set up texture
		mesh_obj->Add_Texture("tex_albedo", OpenGLTextureLibrary::Get_Texture("building_3_albedo"));
		mesh_obj->Add_Texture("tex_normal", OpenGLTextureLibrary::Get_Texture("building_3_normal"));
		Set_Polygon_Mode(mesh_obj,PolygonMode::Fill);
		Set_Shading_Mode(mesh_obj,ShadingMode::Texture);//SHADOW TODO: set Shading Mode to Shadow
		
		////initialize
		mesh_obj->Set_Data_Refreshed();
		mesh_obj->Initialize();	
		mesh_object_array.push_back(mesh_obj);
		return (int)mesh_object_array.size()-1;
	}

	int Add_Buildings_4()
	{
		auto mesh_obj=Add_Interactive_Object<OpenGLTriangleMesh>();

		////read mesh file
		std::string obj_file_name="buildings_4.obj";
		Array<std::shared_ptr<TriangleMesh<3> > > meshes;
		Obj::Read_From_Obj_File_Discrete_Triangles(obj_file_name,meshes);
		mesh_obj->mesh=*meshes[0];

		////set up shader
		mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("texturing"));
		
		//set up texture
		mesh_obj->Add_Texture("tex_albedo", OpenGLTextureLibrary::Get_Texture("building_4_albedo"));
		mesh_obj->Add_Texture("tex_normal", OpenGLTextureLibrary::Get_Texture("building_4_normal"));
		Set_Polygon_Mode(mesh_obj,PolygonMode::Fill);
		Set_Shading_Mode(mesh_obj,ShadingMode::Texture);//SHADOW TODO: set Shading Mode to Shadow
		
		////initialize
		mesh_obj->Set_Data_Refreshed();
		mesh_obj->Initialize();	
		mesh_object_array.push_back(mesh_obj);
		return (int)mesh_object_array.size()-1;
	}

	int Add_Clouds()
	{
		auto mesh_obj=Add_Interactive_Object<OpenGLTriangleMesh>();

		////read mesh file
		std::string obj_file_name="cloudPlane.obj";
		Array<std::shared_ptr<TriangleMesh<3> > > meshes;
		Obj::Read_From_Obj_File_Discrete_Triangles(obj_file_name,meshes);
		mesh_obj->mesh=*meshes[0];

		////set up shader
		mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("clouds"));
		
		//set up texture
		mesh_obj->Add_Texture("tex_albedo", OpenGLTextureLibrary::Get_Texture("building_4_albedo"));
		mesh_obj->Add_Texture("tex_normal", OpenGLTextureLibrary::Get_Texture("building_4_normal"));
		Set_Polygon_Mode(mesh_obj,PolygonMode::Fill);
		Set_Shading_Mode(mesh_obj,ShadingMode::Texture);//SHADOW TODO: set Shading Mode to Shadow
		
		////initialize
		mesh_obj->Set_Data_Refreshed();
		mesh_obj->Initialize();	
		mesh_object_array.push_back(mesh_obj);
		return (int)mesh_object_array.size()-1;
	}

	int Add_Water()
	{
		auto mesh_obj=Add_Interactive_Object<OpenGLTriangleMesh>();

		////read mesh file
		std::string obj_file_name="waterPlane.obj";
		Array<std::shared_ptr<TriangleMesh<3> > > meshes;
		Obj::Read_From_Obj_File_Discrete_Triangles(obj_file_name,meshes);
		mesh_obj->mesh=*meshes[0];

		////set up shader
		mesh_obj->Add_Shader_Program(OpenGLShaderLibrary::Get_Shader("water"));
		
		//set up texture
		mesh_obj->Add_Texture("tex_albedo", OpenGLTextureLibrary::Get_Texture("building_4_albedo"));
		mesh_obj->Add_Texture("tex_normal", OpenGLTextureLibrary::Get_Texture("building_4_normal"));
		Set_Polygon_Mode(mesh_obj,PolygonMode::Fill);
		Set_Shading_Mode(mesh_obj,ShadingMode::Texture);//SHADOW TODO: set Shading Mode to Shadow
		
		////initialize
		mesh_obj->Set_Data_Refreshed();
		mesh_obj->Initialize();	
		mesh_object_array.push_back(mesh_obj);
		return (int)mesh_object_array.size()-1;
	}

	//// Use this function to set up lighting only if you are using Shadow mode
	void Init_Lighting() {
		auto dir_light = OpenGLUbos::Add_Directional_Light(glm::vec3(-1.f, -1.f, -1.f));//Light direction
		dir_light->dif = glm::vec4(.9,.8,.7, 1.0);//diffuse reflection color
		dir_light->Set_Shadow();////SHADOW TODO: turn on the shadow by uncommenting this line, currenly our base code only supports shadow for one light

		//This is an example to add a second directional light
		//auto dir_light_2 = OpenGLUbos::Add_Directional_Light(glm::vec3(1.,1.,1.));//the parameter is light direction
		//dir_light_2->dif = glm::vec4(.9,.9,.9,1.0);
		//dir_light_2->spec = glm::vec4(.2,.2,.2,1.0);

		//This is an example to add a point light
		// auto point_light = OpenGLUbos::Add_Point_Light(glm::vec3(1.,1.,1.));//the parameter is the position of point light
		// point_light->dif = glm::vec4(.9,.8,.7, 1.0);

		//This is an example to add a spot light
		//auto spot_light = OpenGLUbos::Add_Spot_Light(glm::vec3(1.,1.,1.),glm::vec3(1.,1.,1.));//first param: position, second param: direction
		//spot_light->dif = glm::vec4(.9,.8,.7, 1.0);

		OpenGLUbos::Set_Ambient(glm::vec4(.01f, .01f, .02f, 1.f));
		OpenGLUbos::Update_Lights_Ubo();	
	}

	virtual void Initialize_Data()
	{
		Add_Shaders();
		Add_Textures();
		Add_Background();
		Add_Skybox();
		Add_Platform();
		Add_Bridge();
		Add_Buildings_1();
		Add_Buildings_2();
		Add_Buildings_3();
		Add_Buildings_4();
		Add_Clouds();
		Add_Water();
		Add_Obj1();

		Init_Lighting(); ////SHADOW TODO: uncomment this line
	}

	////Goto next frame 
	virtual void Toggle_Next_Frame()
	{
		for (auto& mesh_obj : mesh_object_array) {
			mesh_obj->setTime(GLfloat(clock() - startTime) / CLOCKS_PER_SEC);
		}
		OpenGLViewer::Toggle_Next_Frame();
	}

	virtual void Run()
	{
		OpenGLViewer::Run();
	}
};

int main(int argc,char* argv[])
{
	FinalProjectDriver driver;
	driver.Initialize();
	driver.Run();	
}

#endif