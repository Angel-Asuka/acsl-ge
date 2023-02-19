precision lowp float;

struct PointLight {
    vec3 position;
    vec3 color;
    float constant;
    float linear;
    float quadratic;
};

struct DirLight {
    vec3 direction;
    vec3 color;
};

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D emissive;
    vec4 ambient_add;
    vec4 ambient_mul;
    vec4 diffuse_add;
    vec4 diffuse_mul;
    vec4 specular_add;
    vec4 specular_mul;
    vec4 emissive_add;
    vec4 emissive_mul;
    float shininess;
};

varying mediump vec2 t;             // 贴图坐标
varying mediump vec3 n;             // 法线
varying mediump vec3 p;             // 顶点位置

uniform vec3 c;                     // 摄像机位置
uniform DirLight dir_light;
uniform PointLight point_light[4];
uniform Material material;

vec3 calcPointLight(PointLight light, vec3 normal, vec3 viewDir, vec3 fragPos) {
    vec3 lightDir = normalize(light.position - fragPos);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * light.color;

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = spec * light.color;

    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));
    diffuse *= attenuation;
    specular *= attenuation;

    return (diffuse + specular) * light.color.rgb;
}

vec4 calcDirectLight(DirLight light, vec3 normal, vec3 viewDir, vec4 diff, vec4 spec) {
    vec3 lightDir = normalize(-light.direction);
    vec4 diffuse = diff * max(dot(normal, lightDir), 0.0) * vec4(light.color,1);

    vec3 reflectDir = reflect(normal,lightDir);
    float spec_level = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec4 specular = spec * spec_level * vec4(light.color,1);

    return diffuse + specular;
}

void main(){
    vec3 norm = normalize(n);
    vec3 viewDir = normalize(c - p);

    vec4 color_diffuse = texture2D(material.diffuse, t);
    vec4 ambient = material.ambient_add + material.ambient_mul * color_diffuse;
    vec4 diffuse = material.diffuse_add + material.diffuse_mul * color_diffuse;
    vec4 specular = material.specular_add + material.specular_mul * texture2D(material.specular, t);
    vec4 emissive = material.emissive_add + material.emissive_mul * texture2D(material.emissive, t);

    vec4 result = emissive + ambient;
    result = result + calcDirectLight(dir_light, norm, viewDir, diffuse, specular);
    gl_FragColor = result;
}