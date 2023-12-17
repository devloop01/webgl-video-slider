precision mediump float;

#define PI 3.1415926535897932384626433832795

varying vec2 vUv;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform vec2 uTextureSize0;
uniform vec2 uTextureSize1;
uniform vec2 uPlaneSize;
uniform float uDivs;
uniform float uOffsets[5];

vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
    float screenRatio = screenSize.x / screenSize.y;
    float imageRatio = imageSize.x / imageSize.y;
    vec2 newSize = screenRatio < imageRatio ? vec2(imageSize.x * screenSize.y / imageSize.y, screenSize.y) : vec2(screenSize.x, imageSize.y * screenSize.x / imageSize.x);
    vec2 newOffset = (screenRatio < imageRatio ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
    return uv * screenSize / newSize + newOffset;
}

float expoInOut(float t) {
    return t == 0.0 || t == 1.0 ? t : t < 0.5 ? +0.5 * pow(2.0, (20.0 * t) - 10.0) : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
}

void main() {
    vec2 uv = vUv;
    vec2 uv0 = vUv;

    int index = int(floor(vUv.x * uDivs));

    float offset;
    for(int x = 0; x < int(uDivs); x++) {
        if(x == index) {
            offset = uOffsets[x];
        }
    }

    float offseted = uv.y + offset;

    vec2 texUv0 = uv;
    vec2 texUv1 = uv;

    texUv0 = backgroundCoverUv(uPlaneSize, uTextureSize0, texUv0);
    texUv1 = backgroundCoverUv(uPlaneSize, uTextureSize1, texUv1);

    vec3 tex0 = texture2D(uTexture0, texUv0).rgb;
    tex0 = texture2D(uTexture0, vec2(uv.x, offseted)).rgb;
    vec3 tex1 = texture2D(uTexture1, texUv1).rgb;
    tex1 = texture2D(uTexture1, vec2(uv.x, 1.0 + offseted)).rgb;

    vec3 tex = mix(tex1, tex0, step(0.0, offseted));

    vec3 col = vec3(0.0);
    col = mix(tex, col, 1. - step(0.01, fract(uv0.x * uDivs)));

    // col = vec3(step(0.0, offseted));

    gl_FragColor.rgb = col;
    gl_FragColor.a = 1.0;

}