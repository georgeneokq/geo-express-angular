import path from 'path';

export const rootPath = function() {
    return __dirname;
}

export const srcPath = function() {
    return path.join(__dirname, '/src');
}

export const srcAssetsPath = function() {
    return path.join(srcPath() ,'/assets');
}

export const serverPath = function() {
    return path.join(__dirname, '/server');
}

export const serverAssetsPath = function() {
    return path.join(serverPath(), '/assets');
}

export const distPath = function() {
    return path.join(__dirname, '/dist');
}

export const distAssetsPath = function() {
    return path.join(distPath(),'/assets');
}
 
export const rootUrl = function() {
    return process.env.APP_URL;
}
