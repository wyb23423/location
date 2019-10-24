
interface VectorAxis {
    xaxis: number;
    yaxis: number;
    zaxis: number;
}


/**
 * 获取元素的自定义属性
 */
export function getCustomInfo<K>(el: any, key: string): K | Record<string, undefined> {
    if (el == null) {
        return {};
    }

    el.custom = el.custom == null ? {} : el.custom;
    el.custom[key] = el.custom[key] == null ? {} : el.custom[key];

    return el.custom[key];
}

export const DEFAULT_HEATMAP_CONFIG = {
    gradient: {
        0.45: 'rgb(201,135,255)',
        0.55: 'rgb(189,97,255)',
        0.65: 'rgb(155,49,255)',
        0.95: 'yellow',
        1.0: 'rgb(157,53,255)'
    },
    opacity: 0.5,
    min: 0,
    max: 100,
    radius: 20
};

export function adaptationVector(v: Vector23 | VectorAxis): Vector3 {
    const vector: any = { ...v };
    vector.x = vector.x || vector.xaxis || 0;
    vector.y = vector.y || vector.yaxis || 0;
    vector.z = vector.z || vector.zaxis || null;

    return vector;
}
