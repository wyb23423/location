
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

const config = require('./public/config.json');
const PROXY_TARGET = config.PROXY_TARGET;
const fs = require('fs');
const path = require('path');

module.exports = {
    css: {
        loaderOptions: {
            sass: {
                implementation: require('sass'),
                sassOptions: {
                    fiber: require('fibers'),
                    indentedSyntax: true // optional
                },
            }
        }
    },
    devServer: {
        https: true,
        key: fs.readFileSync(path.join(__dirname, './cert/private.pem')),
        cert: fs.readFileSync(path.join(__dirname, './cert/file.crt')),
        ca: fs.readFileSync(path.join(__dirname, './cert/csr.pem')),
        proxy: {
            '/api': {
                target: PROXY_TARGET,
                ws: true,
                changeOrigin: true,
                onProxyRes(proxyRes) {
                    const oldCookie = proxyRes.headers['set-cookie'];
                    if (oldCookie == null || oldCookie.length == 0) {
                        delete proxyRes.headers['set-cookie'];
                        return;
                    }

                    const oldCookieItems = oldCookie[0].split(';');
                    let newCookie = '';
                    for (let i = 0; i < oldCookieItems.length; ++i) {
                        if (newCookie.length > 0) {
                            newCookie += ';'
                        }
                        if (oldCookieItems[i].indexOf('Domain=') === -1) {
                            newCookie += oldCookieItems[i];
                        }
                    }
                    proxyRes.headers['set-cookie'] = [newCookie];
                }
            },
            '/image': {
                target: PROXY_TARGET
            }
        }
    },
    configureWebpack: {
        plugins: [
            new VuetifyLoaderPlugin()
        ],
        performance: {
            hints: false
        }
    }
}