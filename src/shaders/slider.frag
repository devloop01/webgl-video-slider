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
uniform float uChromaticStrength;

vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
    float screenRatio = screenSize.x / screenSize.y;
    float imageRatio = imageSize.x / imageSize.y;
    vec2 newSize = screenRatio < imageRatio ? vec2(imageSize.x * screenSize.y / imageSize.y, screenSize.y) : vec2(screenSize.x, imageSize.y * screenSize.x / imageSize.x);
    vec2 newOffset = (screenRatio < imageRatio ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
    return uv * screenSize / newSize + newOffset;
}

vec3 chromaticAberration(sampler2D tex, vec2 uv) {
    float offset = 0.01;
    return vec3(texture2D(tex, uv + vec2(0.0, offset)).r, texture2D(tex, uv).g, texture2D(tex, uv - vec2(0.0, offset)).b);
}

void main() {
    vec2 uv = vUv;

    int index = int(floor(vUv.x * uDivs));

    float offset;
    for(int x = 0; x < int(uDivs); x++) {
        if(x == index) {
            offset = uOffsets[x];
        }
    }

    float offseted = uv.y + offset;

    vec2 texUv0 = backgroundCoverUv(uPlaneSize, uTextureSize0, uv);
    vec2 texUv1 = backgroundCoverUv(uPlaneSize, uTextureSize1, uv);

    vec3 tex0 = mix(texture2D(uTexture0, vec2(texUv0.x, offseted)).rgb, chromaticAberration(uTexture0, vec2(texUv0.x, offseted)).rgb, uChromaticStrength);
    vec3 tex1 = mix(texture2D(uTexture1, vec2(texUv1.x, 1.0 + offseted)).rgb, chromaticAberration(uTexture1, vec2(texUv1.x, 1.0 + offseted)).rgb, uChromaticStrength);

    vec3 tex = mix(tex1, tex0, step(0.0, offseted));

    vec3 col = vec3(0.0);
    col = mix(tex, col, 1. - step(0.0075, fract(uv.x * uDivs)));

    // col = vec3(step(0.0, offseted));

    gl_FragColor.rgb = col;
    gl_FragColor.a = 1.0;

}