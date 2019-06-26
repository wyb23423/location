
module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://192.168.1.193',
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
                target: 'http://192.168.1.193'
            }
        }
    }
}