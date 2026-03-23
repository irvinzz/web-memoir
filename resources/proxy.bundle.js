/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./bin/app.ts"
/*!********************!*\
  !*** ./bin/app.ts ***!
  \********************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{//#!/usr/bin/env node\n\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || (function () {\n    var ownKeys = function(o) {\n        ownKeys = Object.getOwnPropertyNames || function (o) {\n            var ar = [];\n            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;\n            return ar;\n        };\n        return ownKeys(o);\n    };\n    return function (mod) {\n        if (mod && mod.__esModule) return mod;\n        var result = {};\n        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== \"default\") __createBinding(result, mod, k[i]);\n        __setModuleDefault(result, mod);\n        return result;\n    };\n})();\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst https_1 = __importDefault(__webpack_require__(/*! https */ \"https\"));\nconst http_1 = __importDefault(__webpack_require__(/*! http */ \"http\"));\nconst net_1 = __importDefault(__webpack_require__(/*! net */ \"net\"));\nconst mongo = __importStar(__webpack_require__(/*! mongodb */ \"mongodb\"));\nconst get_port_1 = __importDefault(__webpack_require__(/*! get-port */ \"get-port\"));\nconst request_handler_factory_1 = __webpack_require__(/*! ../lib/server/request-handler.factory */ \"./lib/server/request-handler.factory.ts\");\nconst tls_1 = __webpack_require__(/*! ../lib/server/tls */ \"./lib/server/tls.ts\");\nconst proxy_1 = __webpack_require__(/*! ../lib/proxy/proxy */ \"./lib/proxy/proxy.ts\");\nconst config_1 = __webpack_require__(/*! ../lib/config */ \"./lib/config.ts\");\nconst logger_1 = __webpack_require__(/*! ../lib/logger */ \"./lib/logger.ts\");\nconst { log, debug, error } = (0, logger_1.logFactory)('app');\n(async () => {\n    process.title = `${config_1.config.app.name} / ${config_1.config.app.version}`;\n    const client = new mongo.MongoClient(config_1.config.db.dbUrl, {\n        connectTimeoutMS: 200,\n        socketTimeoutMS: 200,\n        serverSelectionTimeoutMS: 200,\n    });\n    log(`Connecting to DB`);\n    await client.connect();\n    const db = client.db(config_1.config.db.name);\n    await db.collection('documents').createIndex({ uri: 1, method: 1 }, {});\n    await db.collection('documents').createIndex({ requestHash: 1, requestHashVersion: 1 }, {});\n    debug('indexed created');\n    const bucket = new mongo.GridFSBucket(db);\n    const httpPort = await (0, get_port_1.default)({ port: 3080 });\n    const httpsPort = await (0, get_port_1.default)({ port: 3443 });\n    const proxyServer = net_1.default.createServer();\n    proxyServer.on('connection', (0, proxy_1.getProxyHandler)({ httpPort, httpsPort }));\n    proxyServer.listen(config_1.config.listen.port, config_1.config.listen.host);\n    proxyServer.on('error', (error) => {\n        console.error(error);\n        process.exit(1);\n    });\n    const httpServer = http_1.default.createServer({}).listen(httpPort, '127.0.0.1');\n    const httpsServer = https_1.default.createServer({\n        SNICallback: (domain, cb) => (0, tls_1.getSecureContext)(domain).then(context => cb(null, context)),\n    }).listen(httpsPort, '127.0.0.1');\n    const requestHandler = (0, request_handler_factory_1.requestHandlerFactory)({ bucket, db });\n    for (const httpServerInstance of [httpServer, httpsServer]) {\n        httpServerInstance.prependListener('request', (req, res) => {\n            if (httpServerInstance === httpServer) {\n                req.protocol = 'http';\n            }\n            else {\n                req.protocol = 'https';\n            }\n        });\n        httpServerInstance.on('request', requestHandler);\n    }\n    log(`Ready to listen http://localhost:${config_1.config.listen.port}`);\n})().catch(e => {\n    debug(e);\n    process.exit(1);\n});\nprocess.on('uncaughtException', (err, origin) => {\n    error(err);\n    error(origin);\n});\n\n\n//# sourceURL=webpack://sitedump-proxy/./bin/app.ts?\n}");

/***/ },

/***/ "./interfaces/index.ts"
/*!*****************************!*\
  !*** ./interfaces/index.ts ***!
  \*****************************/
(__unused_webpack_module, exports) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.DomainStatus = void 0;\nvar DomainStatus;\n(function (DomainStatus) {\n    // Always serve from local cache\n    DomainStatus[\"FROZEN\"] = \"frozen\";\n    // Make request only if document not exists in local cache\n    DomainStatus[\"CLONING\"] = \"cloning\";\n    // Always make request\n    DomainStatus[\"FETCHING\"] = \"fetching\";\n})(DomainStatus || (exports.DomainStatus = DomainStatus = {}));\n;\n;\n\n\n//# sourceURL=webpack://sitedump-proxy/./interfaces/index.ts?\n}");

/***/ },

/***/ "./lib/config.ts"
/*!***********************!*\
  !*** ./lib/config.ts ***!
  \***********************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.config = void 0;\nconst node_path_1 = __webpack_require__(/*! node:path */ \"node:path\");\ntry {\n    process.loadEnvFile((0, node_path_1.join)(process.cwd(), '.env'));\n}\ncatch (e) { }\nfunction resolveUpstreamProxy() {\n    const envVal = process.env.UPSTREAM_PROXY;\n    if (!envVal)\n        return undefined;\n    const parsed = new URL(envVal);\n    return {\n        type: parsed.protocol,\n        value: envVal,\n    };\n}\nfunction _requireValue(input) {\n    if (!input)\n        throw new Error('value required');\n    return input;\n}\nexports.config = {\n    app: {\n        name: 'offline-internet-proxy',\n        version: _requireValue(process.env.APP_VERSION),\n    },\n    db: {\n        dbUrl: _requireValue(process.env.DB_URL),\n        name: _requireValue(process.env.DB_NAME),\n    },\n    listen: {\n        port: Number.parseInt(process.env.PORT || '3128', 10),\n        host: process.env.HOST,\n    },\n    selfAddress: _requireValue(process.env.SELF_ADDRESS),\n    ssl: {\n        key: _requireValue(process.env.CA_KEY_PATH),\n        crt: _requireValue(process.env.CA_CRT_PATH),\n    },\n    rcpwd: _requireValue(process.env.RCPWD),\n    fetchtimeout: 1000,\n    upstreamProxy: resolveUpstreamProxy(),\n    reqHeaders: {},\n    cachableStatuses: [200, 301, 302, 404],\n    offlineMode: process.env.OFFLINE_MODE,\n};\n\n\n//# sourceURL=webpack://sitedump-proxy/./lib/config.ts?\n}");

/***/ },

/***/ "./lib/logger.ts"
/*!***********************!*\
  !*** ./lib/logger.ts ***!
  \***********************/
(__unused_webpack_module, exports) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.logFactory = logFactory;\nfunction fitTo(input, size) {\n    return input.slice(0, size).padEnd(size, ' ');\n}\nfunction logFactory(context) {\n    return {\n        log: function log(...msg) {\n            console.log(`[${fitTo(context, 10)}]`, fitTo(msg.join(' '), 128));\n        },\n        debug: function debug(...msg) {\n            console.debug(`[${fitTo(context, 10)}]`, fitTo(msg.join(' '), 128));\n        },\n        error: function debug(...msg) {\n            console.error(`[${fitTo(context, 10)}]`, fitTo(msg.join(' '), 128));\n        },\n    };\n}\n\n\n//# sourceURL=webpack://sitedump-proxy/./lib/logger.ts?\n}");

/***/ },

/***/ "./lib/proxy/proxy.ts"
/*!****************************!*\
  !*** ./lib/proxy/proxy.ts ***!
  \****************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || (function () {\n    var ownKeys = function(o) {\n        ownKeys = Object.getOwnPropertyNames || function (o) {\n            var ar = [];\n            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;\n            return ar;\n        };\n        return ownKeys(o);\n    };\n    return function (mod) {\n        if (mod && mod.__esModule) return mod;\n        var result = {};\n        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== \"default\") __createBinding(result, mod, k[i]);\n        __setModuleDefault(result, mod);\n        return result;\n    };\n})();\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getProxyHandler = void 0;\n/**\n * @source https://medium.com/@nimit95/a-simple-http-https-proxy-in-node-js-4eb0444f38fc\n */\nconst net = __importStar(__webpack_require__(/*! net */ \"net\"));\nconst logger_1 = __webpack_require__(/*! ../logger */ \"./lib/logger.ts\");\nconst { log, debug, } = (0, logger_1.logFactory)('proxy');\nconst getProxyHandler = ({ httpPort, httpsPort }) => (clientSocket) => {\n    // console.log('Client Connected To Proxy');\n    // We need only the data once, the starting packet\n    clientSocket.once('data', function clientToProxySocketOnData(data) {\n        const chunk = data.toString();\n        // const [method, target, protocol] = chunk.split(' ');\n        // log(method, target, protocol);\n        const isTLSConnection = chunk.indexOf('CONNECT') !== -1;\n        const isHttpConnection = chunk.indexOf('Host:') !== -1;\n        // Considering Port as 80 by default\n        let serverPort = 80;\n        let serverAddress;\n        if (isTLSConnection) {\n            // Port changed to 443, parsing the host from CONNECT\n            serverPort = 443;\n            serverAddress = chunk\n                .split('CONNECT ')[1]\n                .split(' ')[0].split(':')[0];\n        }\n        else if (isHttpConnection) {\n            // Parsing HOST from HTTP\n            serverAddress = chunk\n                .split('Host: ')[1]\n                .split('\\r\\n')[0];\n        }\n        else {\n            clientSocket.end();\n            return;\n        }\n        function unpipe() {\n            clientSocket.unpipe(serverSocket);\n            serverSocket.unpipe(clientSocket);\n            if (!clientSocket.closed) {\n                clientSocket.end();\n            }\n            if (!serverSocket.closed) {\n                serverSocket.end();\n            }\n        }\n        let serverSocket = net.createConnection({\n            host: '127.0.0.1',\n            port: isTLSConnection ? httpsPort : httpPort,\n            // host: serverAddress,\n            // port: isTLSConnection ? 443 : 80,\n            timeout: 30000,\n        }, function connectionListener() {\n            if (isTLSConnection) {\n                // Send Back OK to HTTPS CONNECT Request\n                // clientSocket.write('HTTP/1.1 200 OK\\r\\n\\n');\n                clientSocket.write('HTTP/1.1 200 Connection Established\\r\\n\\r\\n');\n            }\n            else if (isHttpConnection) {\n                serverSocket.write(data);\n            }\n            // Piping the sockets\n            clientSocket.pipe(serverSocket);\n            serverSocket.pipe(clientSocket);\n            clientSocket.on('close', (hadError) => {\n                debug('clientSocket:close');\n                unpipe();\n            });\n            clientSocket.on('end', () => {\n                debug('clientSocket:end');\n                unpipe();\n            });\n            clientSocket.on('error', function clientToProxySocketOnError(err) {\n                log('clientSocket:error', err);\n                unpipe();\n            });\n            serverSocket.on('end', () => {\n                debug('serverSocket:end');\n                unpipe();\n            });\n            serverSocket.on('close', (hadError) => {\n                debug('serverSocket:close', hadError);\n                unpipe();\n            });\n            serverSocket.on('error', function proxyToServerSocketOnError(err) {\n                log('serverSocket:error', err);\n                unpipe();\n            });\n            serverSocket.on('timeout', () => {\n                log('serverSocket:timeout', serverAddress);\n                unpipe();\n            });\n            /*\n            clientToProxySocket.on('destroyed', function clientToProxySocketOnDestroyed() {\n              proxyToServerSocket.destroy();\n            });\n            proxyToServerSocket.on('error', function proxyToServerSocketOnError(err) {\n              console.debug('proxyToServerSocket error', err);\n              clientToProxySocket.destroy();\n            });\n            */\n        });\n    });\n};\nexports.getProxyHandler = getProxyHandler;\n\n\n//# sourceURL=webpack://sitedump-proxy/./lib/proxy/proxy.ts?\n}");

/***/ },

/***/ "./lib/server/const.ts"
/*!*****************************!*\
  !*** ./lib/server/const.ts ***!
  \*****************************/
(__unused_webpack_module, exports) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.infiniteFuture = void 0;\nexports.infiniteFuture = (new Date('2100')).toUTCString();\n\n\n//# sourceURL=webpack://sitedump-proxy/./lib/server/const.ts?\n}");

/***/ },

/***/ "./lib/server/hash.ts"
/*!****************************!*\
  !*** ./lib/server/hash.ts ***!
  \****************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.sha256 = sha256;\nexports.getRequestHash = getRequestHash;\nconst node_crypto_1 = __webpack_require__(/*! node:crypto */ \"node:crypto\");\nfunction sha256(input) {\n    return (0, node_crypto_1.createHash)('sha256').update(input, 'utf-8').digest().toString('base64');\n}\nfunction pick(source, keys) {\n    return Object.entries(source).reduce((acc, curr) => {\n        const [key, value] = curr;\n        if (keys.includes(key))\n            return {\n                ...acc,\n                [key]: value,\n            };\n        return acc;\n    }, {});\n}\n;\ngetRequestHash.version = '4';\nfunction getRequestHash(clientRequest) {\n    const hashProto = {\n        requestBody: clientRequest.bodyChunks ? Buffer.concat(clientRequest.bodyChunks).toString() : '',\n        headers: pick(clientRequest.headers, [\n            'accept',\n        ]),\n    };\n    const hash = sha256(JSON.stringify(hashProto));\n    return hash;\n}\n\n\n//# sourceURL=webpack://sitedump-proxy/./lib/server/hash.ts?\n}");

/***/ },

/***/ "./lib/server/request-handler.factory.ts"
/*!***********************************************!*\
  !*** ./lib/server/request-handler.factory.ts ***!
  \***********************************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.requestHandlerFactory = void 0;\nconst interfaces_1 = __webpack_require__(/*! ../../interfaces */ \"./interfaces/index.ts\");\nconst logger_1 = __webpack_require__(/*! ../logger */ \"./lib/logger.ts\");\nconst util_1 = __webpack_require__(/*! ./util */ \"./lib/server/util.ts\");\nconst serve_from_source_1 = __webpack_require__(/*! ./serve-from-source */ \"./lib/server/serve-from-source.ts\");\nconst serve_from_cache_1 = __webpack_require__(/*! ./serve-from-cache */ \"./lib/server/serve-from-cache.ts\");\nconst const_1 = __webpack_require__(/*! ./const */ \"./lib/server/const.ts\");\nconst config_1 = __webpack_require__(/*! ../config */ \"./lib/config.ts\");\nconst hash_1 = __webpack_require__(/*! ./hash */ \"./lib/server/hash.ts\");\nconst { log } = (0, logger_1.logFactory)('request');\nfunction expired(expires) {\n    return new Date(expires) < new Date();\n}\nconst requestHandlerFactory = (handlerContext) => function requestHandler(clientRequest, clientResponse) {\n    /*\n    clientRequest.socket.once('error', (err) => {\n      console.error('clientRequest.socket:error', err);\n    });\n    clientRequest.once('close', () => {\n      log('clientRequest:close');\n    });\n    */\n    let localErr;\n    const { db, bucket } = handlerContext;\n    clientRequest.timings = {};\n    const domainsCollection = db.collection('domains');\n    const cacheCollection = db.collection('documents');\n    const reqHeaders = clientRequest.headers;\n    const urlPath = clientRequest.url;\n    const fetchForced = (reqHeaders['x-oi-cmd'] === 'refetch' && reqHeaders['x-oi-rcpwd'] === config_1.config.rcpwd);\n    const parsedUrl = new URL(clientRequest.url, `${clientRequest.protocol}://${clientRequest.headers.host}`);\n    async function getCacheRecord() {\n        const requestHash = (0, hash_1.getRequestHash)(clientRequest);\n        const cacheRecord = await cacheCollection.findOne({\n            $and: [{\n                    uri: parsedUrl.toString(),\n                    method: clientRequest.method,\n                }, {\n                    $or: [{\n                            requestHash,\n                            requestHashVersion: hash_1.getRequestHash.version,\n                        }, {\n                            requestHashVersion: {\n                                $ne: hash_1.getRequestHash.version,\n                            },\n                        }],\n                }],\n            // requestHeaders: {\n            // Range bytes\n            // \n            // },\n        });\n        cacheRecord && clientResponse.setHeader('x-oi-document-id', cacheRecord._id.toString());\n        return cacheRecord;\n    }\n    function serveNotFound() {\n        //  Сайт заморожен, а кеша нет\n        clientResponse.setHeader('x-oi-document-status', 'NOT_FOUND;NOT_AVAILABLE');\n        clientRequest.cacheStatus = 'NOT_FOUND;NOT_AVAILABLE';\n        clientResponse.setHeader('content-type', 'application/json');\n        clientResponse.statusCode = 404;\n        clientResponse.end(JSON.stringify({ status: 404, message: 'Cache missing' }));\n    }\n    (async () => {\n        const [urlHostname, port] = parsedUrl.host.split(':');\n        const domainDocument = await domainsCollection.findOneAndUpdate({\n            $or: [\n                { domain: urlHostname },\n                { aliases: urlHostname },\n            ],\n        }, {\n            $setOnInsert: {\n                domain: urlHostname,\n                status: interfaces_1.DomainStatus.FETCHING,\n            },\n        }, {\n            upsert: true,\n            returnDocument: 'after',\n        });\n        // if (!domain || (port !== null && port !== '80')) {    //  temporary\n        if (!domainDocument) {\n            clientResponse.statusCode = 403;\n            clientResponse.end('access denied');\n            return;\n        }\n        clientResponse.setHeader('x-oi-domain-status', domainDocument.status);\n        (0, util_1.logTimings)(clientRequest, 'init');\n        await new Promise((resolve, reject) => {\n            const bodyChunks = [];\n            clientRequest.on('error', (err) => reject(err));\n            clientRequest.on('data', (chunk) => bodyChunks.push(chunk));\n            clientRequest.on('end', async function onClientRequestEnd() {\n                (0, util_1.logTimings)(clientRequest, 'clientRequestBodyEnd');\n                clientRequest.bodyChunks = bodyChunks;\n                resolve();\n            });\n        });\n        if (clientResponse.closed)\n            return;\n        (0, util_1.logTimings)(clientRequest, 'dbReadEnd');\n        clientResponse.setHeader('x-oi-powered-by', config_1.config.app.name + ' v' + config_1.config.app.version);\n        if (config_1.config.offlineMode || domainDocument.status === interfaces_1.DomainStatus.FROZEN) {\n            const cacheRecord = await getCacheRecord();\n            if (cacheRecord) {\n                //  Кэш есть\n                const cacheLastModified = cacheRecord._meta['last-modified'];\n                clientResponse.setHeader('Expires', const_1.infiniteFuture);\n                clientResponse.setHeader('Last-Modified', cacheLastModified.toUTCString());\n                clientResponse.setHeader('Age', '0');\n                clientResponse.setHeader('Cache-Control', 'public');\n                clientResponse.removeHeader('Pragma');\n                clientResponse.setHeader('x-oi-document-status', `FOUND;SERVING`);\n                clientRequest.cacheStatus = 'FOUND;SERVING';\n                await (0, serve_from_cache_1.serveFromCache)(clientRequest, clientResponse, {\n                    bucket,\n                    cacheRecord,\n                    domainDocument,\n                });\n            }\n            else {\n                serveNotFound();\n            }\n        }\n        else if (domainDocument.status === interfaces_1.DomainStatus.CLONING) {\n            const cacheRecord = await getCacheRecord();\n            if (cacheRecord && !expired(cacheRecord.responseHeaders.expires) && !fetchForced) {\n                //  Кэш есть\n                clientResponse.setHeader('x-oi-document-status', `FOUND;SERVING`);\n                clientRequest.cacheStatus = 'FOUND;SERVING';\n                await (0, serve_from_cache_1.serveFromCache)(clientRequest, clientResponse, {\n                    bucket,\n                    cacheRecord,\n                    domainDocument,\n                });\n            }\n            else {\n                //  Сайт не заморожен, кеша нет, протух или дожен быть обновлен\n                clientResponse.setHeader('x-oi-document-status', 'NOT_FOUND;PROXYING');\n                clientRequest.cacheStatus = 'NOT_FOUND;PROXYING';\n                await (0, serve_from_source_1.serveFromSource)(clientRequest, clientResponse, {\n                    parsedUrl,\n                    urlPath,\n                    bucket,\n                    cacheCollection,\n                });\n            }\n        }\n        else if (domainDocument.status === interfaces_1.DomainStatus.FETCHING) {\n            //  Сайт не заморожен, кеша нет, протух или дожен быть обновлен\n            clientResponse.setHeader('x-oi-document-status', 'PROXYING');\n            clientRequest.cacheStatus = 'PROXYING';\n            await (0, serve_from_source_1.serveFromSource)(clientRequest, clientResponse, {\n                parsedUrl,\n                urlPath,\n                bucket,\n                cacheCollection,\n            });\n        }\n    })().catch((err) => {\n        localErr = err;\n        if (!clientResponse.headersSent) {\n            clientResponse.setHeader('content-type', 'application/json');\n            clientResponse.writeHead(500, JSON.stringify({\n                name: err === null || err === void 0 ? void 0 : err.name,\n                message: err === null || err === void 0 ? void 0 : err.message,\n                stack: err === null || err === void 0 ? void 0 : err.stack,\n            }));\n        }\n        clientResponse.end();\n    }).finally(() => {\n        var _a;\n        if (clientRequest.timings) {\n            delete clientRequest.timings._last;\n        }\n        log([\n            clientRequest.method,\n            (_a = clientRequest.cacheStatus) === null || _a === void 0 ? void 0 : _a.padEnd(20, ''),\n            `[${decodeURI(parsedUrl.toString()).slice(0, 96).padEnd(96, ' ')}]`,\n            localErr ? `:ERROR '${localErr === null || localErr === void 0 ? void 0 : localErr.message}':'${localErr === null || localErr === void 0 ? void 0 : localErr.stack}'` : '',\n            //  localErr?.stack\n        ].join('\\t'), `HANDLER`);\n    });\n};\nexports.requestHandlerFactory = requestHandlerFactory;\n\n\n//# sourceURL=webpack://sitedump-proxy/./lib/server/request-handler.factory.ts?\n}");

/***/ },

/***/ "./lib/server/serve-from-cache.ts"
/*!****************************************!*\
  !*** ./lib/server/serve-from-cache.ts ***!
  \****************************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.serveFromCache = serveFromCache;\nconst promises_1 = __webpack_require__(/*! stream/promises */ \"stream/promises\");\nconst logger_1 = __webpack_require__(/*! ../logger */ \"./lib/logger.ts\");\nconst { error } = (0, logger_1.logFactory)('server:cache');\nasync function serveFromCache(clientRequest, clientResponse, context) {\n    const { cacheRecord, domainDocument, bucket } = context;\n    const reqHeaders = clientRequest.headers;\n    for (const [key, value] of Object.entries(cacheRecord.responseHeaders)) {\n        clientResponse.setHeader(key, value);\n    }\n    const cacheLastModified = cacheRecord._meta['last-modified'];\n    const serveNotModifiedAllowed = [\n        () => {\n            return ((!!reqHeaders['if-none-match']) && (reqHeaders['if-none-match'] === cacheRecord.responseHeaders.etag)) || ((!!reqHeaders['if-modified-since']) && (((new Date(reqHeaders['if-modified-since']) <= new Date(cacheRecord.responseHeaders['last-modified'])) || (domainDocument.status === 'frozen' && (new Date(reqHeaders['if-modified-since']) <= cacheLastModified)))));\n        },\n        () => reqHeaders.pragma !== 'no-cache',\n        () => reqHeaders['cache-control'] !== 'no-cache',\n        () => cacheRecord.statusCode === 200,\n    ].every(condition => condition());\n    if (serveNotModifiedAllowed) {\n        clientResponse.setHeader('x-oi-cache-status', '304');\n        clientResponse.statusCode = 304;\n        clientResponse.end();\n    }\n    else {\n        clientResponse.setHeader('x-oi-cache-status', '200');\n        clientResponse.statusCode = cacheRecord.statusCode;\n        if (cacheRecord.responseBodyId) {\n            const gridCacheReadStream = bucket.openDownloadStream(cacheRecord.responseBodyId);\n            await (0, promises_1.pipeline)(gridCacheReadStream, clientResponse);\n        }\n        if (cacheRecord.responseBody) {\n            clientResponse.write(cacheRecord.responseBody.buffer);\n        }\n        else {\n            // no body\n        }\n    }\n}\n\n\n//# sourceURL=webpack://sitedump-proxy/./lib/server/serve-from-cache.ts?\n}");

/***/ },

/***/ "./lib/server/serve-from-source.ts"
/*!*****************************************!*\
  !*** ./lib/server/serve-from-source.ts ***!
  \*****************************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || (function () {\n    var ownKeys = function(o) {\n        ownKeys = Object.getOwnPropertyNames || function (o) {\n            var ar = [];\n            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;\n            return ar;\n        };\n        return ownKeys(o);\n    };\n    return function (mod) {\n        if (mod && mod.__esModule) return mod;\n        var result = {};\n        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== \"default\") __createBinding(result, mod, k[i]);\n        __setModuleDefault(result, mod);\n        return result;\n    };\n})();\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.serveFromSource = serveFromSource;\nconst http_1 = __importDefault(__webpack_require__(/*! http */ \"http\"));\nconst https_1 = __importDefault(__webpack_require__(/*! https */ \"https\"));\nconst node_dns_1 = __importDefault(__webpack_require__(/*! node:dns */ \"node:dns\"));\nconst socks_proxy_agent_1 = __webpack_require__(/*! socks-proxy-agent */ \"socks-proxy-agent\");\nconst stream_1 = __webpack_require__(/*! stream */ \"stream\");\nconst agentkeepalive_1 = __importStar(__webpack_require__(/*! agentkeepalive */ \"agentkeepalive\"));\nconst mongodb_1 = __webpack_require__(/*! mongodb */ \"mongodb\");\nconst util_1 = __webpack_require__(/*! ./util */ \"./lib/server/util.ts\");\nconst config_1 = __webpack_require__(/*! ../config */ \"./lib/config.ts\");\nconst logger_1 = __webpack_require__(/*! ../logger */ \"./lib/logger.ts\");\nconst hash_1 = __webpack_require__(/*! ./hash */ \"./lib/server/hash.ts\");\nconst { error, debug } = (0, logger_1.logFactory)('server:source');\nfunction getAgent(protocol) {\n    if (config_1.config.upstreamProxy) {\n        switch (config_1.config.upstreamProxy.type) {\n            case 'socks5:':\n                return new socks_proxy_agent_1.SocksProxyAgent(config_1.config.upstreamProxy.value, {\n                    keepAlive: true,\n                    timeout: 30000,\n                    lookup: (hostname, options, callback) => {\n                        return node_dns_1.default.lookup(hostname, {\n                            ...options,\n                            family: 'IPv4',\n                            all: false,\n                        }, callback);\n                    },\n                });\n        }\n    }\n    else {\n        if (protocol === 'http') {\n            return new agentkeepalive_1.default({\n                maxSockets: 100,\n                maxFreeSockets: 10,\n                timeout: 60000,\n                // keepAliveTimeout: 30000 // free socket keepalive for 30 seconds \n            });\n        }\n        else {\n            return new agentkeepalive_1.HttpsAgent({\n                maxSockets: 100,\n                maxFreeSockets: 10,\n                timeout: 60000,\n                // keepAliveTimeout: 30000 // free socket keepalive for 30 seconds \n            });\n        }\n    }\n    return undefined;\n}\nconst httpAgent = getAgent('http');\nconst httpsAgent = getAgent('https');\nasync function serveFromSource(clientRequest, clientResponse, context) {\n    const requestedAt = new Date();\n    const { parsedUrl, urlPath, cacheCollection, bucket } = context;\n    //  Headers override\n    const serverRequestHeaders = {\n        ...clientRequest.headers,\n        ...config_1.config.reqHeaders,\n    };\n    delete serverRequestHeaders['x-oi-cmd'];\n    delete serverRequestHeaders['x-oi-rcpwd'];\n    if (clientRequest.headers['Accept-Encoding']) {\n        serverRequestHeaders['Accept-Encoding'] = clientRequest.headers['Accept-Encoding'];\n    }\n    else {\n        delete serverRequestHeaders['Accept-Encoding'];\n    }\n    const responseBodyCacheFileName = (0, hash_1.sha256)(urlPath);\n    const httpClient = parsedUrl.protocol === 'https:' ? https_1.default : http_1.default;\n    await new Promise((resolve, reject) => {\n        debug(parsedUrl.toString());\n        const serverRequest = httpClient.request({\n            hostname: parsedUrl.hostname,\n            port: parsedUrl.port,\n            path: urlPath,\n            method: clientRequest.method,\n            headers: {\n                ...serverRequestHeaders,\n                Host: parsedUrl.hostname,\n            },\n            agent: clientRequest.protocol === 'https' ? httpsAgent : httpAgent,\n            timeout: 30000,\n        });\n        serverRequest.removeHeader('proxy-connection');\n        serverRequest.on('response', function (serverResponse) {\n            var _a;\n            (0, util_1.logTimings)(clientRequest, 'serverRequestResponse');\n            const serverResponseHeaders = serverResponse.headers;\n            const serverResponseStatusCode = serverResponse.statusCode;\n            for (const [key, value] of Object.entries(serverResponseHeaders)) {\n                if (key.toLowerCase() === ('Strict-Transport-Security'.toLowerCase())) {\n                    continue;\n                }\n                clientResponse.setHeader(key, value);\n            }\n            clientResponse.statusCode = serverResponse.statusCode || 200;\n            if (!config_1.config.cachableStatuses.find(x => x === serverResponseStatusCode)) {\n                serverResponse.pipe(clientResponse);\n                return;\n            }\n            ;\n            const contentLength = serverResponseHeaders['content-length'] ? Number.parseInt(serverResponseHeaders['content-length'], 10) : undefined;\n            const contentIsAttachment = (_a = serverRequestHeaders['content-disposition']) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('attachment');\n            const serverResponseBodyWriteStreamWrapper = (() => {\n                // if (contentIsAttachment || contentLength > 1024 * 1024) {\n                if (true) {\n                    /*\n                    const inputStream = bucket.openUploadStream(\n                      `${responseBodyCacheFileName}.request`,\n                      {\n                        metadata: {\n                          url: parsedUrl.toString(),\n                          ['content-type']: clientRequest.headers['content-type'],\n                        },\n                      }\n                    );\n                    */\n                    const outputStream = bucket.openUploadStream(responseBodyCacheFileName, {\n                        metadata: {\n                            url: parsedUrl.toString(),\n                            ['content-type']: serverResponseHeaders['content-type'],\n                        },\n                    });\n                    return {\n                        // inputStream,\n                        outputStream,\n                        documentId: outputStream.id,\n                    };\n                }\n                else // removed by dead control flow\n{}\n            })();\n            serverResponse.pipe(clientResponse);\n            serverResponse.pipe(serverResponseBodyWriteStreamWrapper.outputStream);\n            serverResponse.on('error', (e) => {\n                error('serverResponse', 'error', e);\n                reject(e);\n            });\n            serverResponse.on('end', async function onServerResponseEnd() {\n                var _a;\n                try {\n                    const requestHash = (0, hash_1.getRequestHash)(clientRequest);\n                    (0, util_1.logTimings)(clientRequest, 'serverResponseEnd');\n                    await cacheCollection.findOneAndReplace({\n                        uri: parsedUrl.toString(),\n                        method: clientRequest.method,\n                        requestHash,\n                    }, {\n                        uri: parsedUrl.toString(),\n                        method: clientRequest.method,\n                        requestHash,\n                        requestHashVersion: hash_1.getRequestHash.version,\n                        requestedAt,\n                        requestHeaders: clientRequest.headers,\n                        requestBody: ((_a = clientRequest.bodyChunks) === null || _a === void 0 ? void 0 : _a.length) ? new mongodb_1.Binary(Buffer.concat(clientRequest.bodyChunks)) : undefined,\n                        responseHeaders: serverResponseHeaders,\n                        responseBody: serverResponseBodyWriteStreamWrapper.chunks ? new mongodb_1.Binary(Buffer.concat(serverResponseBodyWriteStreamWrapper.chunks)) : undefined,\n                        responseBodyId: serverResponseBodyWriteStreamWrapper.documentId,\n                        statusCode: serverResponseStatusCode || 200,\n                        _meta: {\n                            'last-modified': (!!serverResponseHeaders['last-modified'] ? new Date(serverResponseHeaders['last-modified']) : new Date()),\n                            'expires': (!!serverResponseHeaders['expires'] ? new Date(serverResponseHeaders['expires']) : undefined)\n                        },\n                    }, {\n                        upsert: true,\n                    });\n                    (0, util_1.logTimings)(clientRequest, 'cacheWriteEnd');\n                }\n                catch (e) {\n                    error('e', e);\n                }\n            });\n        });\n        // clientRequest.on('destroyed', function onClientRequestDestroyed() { serverRequest.destroy(); reject(new Error(`clientRequest:destroyed`)) });\n        serverRequest.on('error', function onServerRequestError(err) {\n            error('serverRequest:error', err);\n            /* clientRequest.destroy(); */\n            reject(err);\n        });\n        // serverRequest.on('close', function onServerRequestAbort() { reject(); })\n        serverRequest.on('socket', function onServerRequestSocket(socket) {\n            socket.on('error', (err) => {\n                error('serverRequest:error', err, parsedUrl.toString());\n                reject(error);\n            });\n            socket.on('timeout', () => {\n                error('socket:timeout', parsedUrl.toString());\n                reject();\n            });\n            // socket.setTimeout(60 * 1000, () => {\n            //   serverRequest.destroy();\n            // });\n            if (clientRequest.destroyed) {\n                // return serverRequest.destroy();\n            }\n            if (clientRequest.bodyChunks) {\n                for (const chunk of clientRequest.bodyChunks) {\n                    serverRequest.write(chunk);\n                }\n                (0, util_1.logTimings)(clientRequest, 'serverRequestBodyRequestWriteEnd');\n            }\n            serverRequest.end();\n            // clientRequest.pipe(serverRequest);\n            // clientRequest.pipe(clientRequestBodyUploadStream);\n        });\n        serverRequest.on('timeout', function onServerRequestTimeout() {\n            error('serverRequest:timeout', parsedUrl.toString());\n            reject();\n        });\n        clientResponse.on('close', () => {\n            debug('clientResponse:close');\n            resolve();\n        });\n    });\n}\n\n\n//# sourceURL=webpack://sitedump-proxy/./lib/server/serve-from-source.ts?\n}");

/***/ },

/***/ "./lib/server/tls.ts"
/*!***************************!*\
  !*** ./lib/server/tls.ts ***!
  \***************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || (function () {\n    var ownKeys = function(o) {\n        ownKeys = Object.getOwnPropertyNames || function (o) {\n            var ar = [];\n            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;\n            return ar;\n        };\n        return ownKeys(o);\n    };\n    return function (mod) {\n        if (mod && mod.__esModule) return mod;\n        var result = {};\n        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== \"default\") __createBinding(result, mod, k[i]);\n        __setModuleDefault(result, mod);\n        return result;\n    };\n})();\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getSecureContext = getSecureContext;\nconst fs = __importStar(__webpack_require__(/*! fs */ \"fs\"));\nconst tls = __importStar(__webpack_require__(/*! tls */ \"tls\"));\nconst https = __importStar(__webpack_require__(/*! https */ \"https\"));\n// @ts-expect-error\nconst forge = __importStar(__webpack_require__(/*! node-forge */ \"node-forge\"));\nconst logger_1 = __webpack_require__(/*! ../logger */ \"./lib/logger.ts\");\nconst config_1 = __webpack_require__(/*! ../config */ \"./lib/config.ts\");\nconst { log } = (0, logger_1.logFactory)('tls');\nconst rootCaKey = fs.readFileSync(config_1.config.ssl.key, 'utf-8');\nconst rootCaCrt = fs.readFileSync(config_1.config.ssl.crt, 'utf-8');\n;\nconst inMemCertStore = {};\nconst certRequests = {};\nconst DAYS = 10;\nconst HOURms = 60 * 60 * 1000;\nconst DAYms = HOURms * 24;\nconst ValidDuration = DAYS * DAYms - 1 * HOURms;\nfunction isValid(context) {\n    if (!context)\n        return false;\n    const { createdAt: date } = context;\n    return (date.getTime() + ValidDuration) < ((new Date().getTime()));\n}\nasync function getSecureContext(domain) {\n    const currentContext = inMemCertStore[domain];\n    if (currentContext && isValid(currentContext)) {\n        return currentContext;\n    }\n    if (!certRequests[domain]) {\n        certRequests[domain] = (async () => {\n            var _a;\n            const peerCertificate = await new Promise((resolve, reject) => {\n                const request = https.request({\n                    hostname: domain,\n                    port: 443,\n                    path: '/',\n                    method: 'GET',\n                    agent: new https.Agent({ maxCachedSessions: 0 }),\n                    timeout: 5000,\n                }, (res) => {\n                    const certificate = res.socket.getPeerCertificate();\n                    if (certificate) {\n                        resolve(certificate);\n                    }\n                    else {\n                        reject(`Can't extract certificate`);\n                    }\n                });\n                request.end();\n            });\n            const altNames = (((_a = peerCertificate.subjectaltname) === null || _a === void 0 ? void 0 : _a.split(', ')) || [])\n                .filter(item => item.startsWith('DNS:'))\n                .map(item => item.replace('DNS:', ''));\n            const createCertPromise = new Promise((resolve, reject) => {\n                const caKey = forge.pki.privateKeyFromPem(rootCaKey);\n                const caCrt = forge.pki.certificateFromPem(rootCaCrt);\n                const leafKeys = forge.pki.rsa.generateKeyPair(2048);\n                const leafCert = forge.pki.createCertificate();\n                leafCert.publicKey = leafKeys.privateKey;\n                leafCert.serialNumber = (Math.floor(Math.random() * 1e9)).toString();\n                const now = new Date();\n                leafCert.validity.notBefore = now;\n                leafCert.validity.notAfter = new Date(now.getTime() + DAYS * 24 * 60 * 60 * 1000);\n                const attrsSubject = [\n                    peerCertificate.subject.CN && {\n                        name: 'commonName',\n                        value: peerCertificate.subject.CN,\n                    },\n                    peerCertificate.subject.C && {\n                        name: 'countryName',\n                        value: peerCertificate.subject.C,\n                    },\n                    peerCertificate.subject.ST && {\n                        shortName: 'ST',\n                        value: peerCertificate.subject.ST,\n                    },\n                    peerCertificate.subject.L && {\n                        name: 'localityName',\n                        value: peerCertificate.subject.L,\n                    },\n                    peerCertificate.subject.O && {\n                        name: 'organizationName',\n                        value: peerCertificate.subject.O,\n                    },\n                    peerCertificate.subject.OU && {\n                        shortName: 'OU',\n                        value: peerCertificate.subject.OU,\n                    },\n                ].filter(Boolean);\n                leafCert.setSubject(attrsSubject);\n                leafCert.setIssuer(caCrt.subject.attributes);\n                leafCert.setExtensions([\n                    {\n                        name: 'basicConstraints',\n                        cA: false,\n                    },\n                    {\n                        name: 'keyUsage',\n                        digitalSignature: true,\n                        keyEncipherment: true,\n                    },\n                    {\n                        name: 'extKeyUsage',\n                        serverAuth: true,\n                    },\n                    {\n                        name: 'subjectAltName',\n                        altNames: altNames.map(name => ({\n                            type: 2,\n                            value: name,\n                        })),\n                    },\n                ]);\n                leafCert.sign(caKey, forge.md.sha256.create());\n                log('issued certitifact for ', domain, ...altNames);\n                const certContext = {\n                    context: tls.createSecureContext({\n                        key: forge.pki.privateKeyToPem(leafKeys.privateKey),\n                        cert: forge.pki.certificateToPem(leafCert),\n                        ca: [\n                            rootCaCrt,\n                        ]\n                    }).context,\n                    createdAt: new Date(),\n                };\n                for (const altDomainName of [domain, ...altNames]) {\n                    inMemCertStore[altDomainName] = certContext;\n                }\n                resolve();\n            });\n            for (const domain of altNames) {\n                if (!certRequests[domain]) {\n                    certRequests[domain] = createCertPromise;\n                }\n            }\n            return createCertPromise;\n        })();\n    }\n    return (certRequests[domain]).then(() => inMemCertStore[domain]);\n}\n\n\n//# sourceURL=webpack://sitedump-proxy/./lib/server/tls.ts?\n}");

/***/ },

/***/ "./lib/server/util.ts"
/*!****************************!*\
  !*** ./lib/server/util.ts ***!
  \****************************/
(__unused_webpack_module, exports) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.logTimings = logTimings;\nfunction logTimings(clientRequest, name) {\n    const now = (new Date()).getTime();\n    const previousTime = clientRequest.timings._last || now;\n    const diff = now - previousTime;\n    clientRequest.timings[name] = diff;\n    clientRequest.timings._last = now;\n}\n\n\n//# sourceURL=webpack://sitedump-proxy/./lib/server/util.ts?\n}");

/***/ },

/***/ "agentkeepalive"
/*!*********************************!*\
  !*** external "agentkeepalive" ***!
  \*********************************/
(module) {

module.exports = require("agentkeepalive");

/***/ },

/***/ "fs"
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
(module) {

module.exports = require("fs");

/***/ },

/***/ "get-port"
/*!***************************!*\
  !*** external "get-port" ***!
  \***************************/
(module) {

module.exports = require("get-port");

/***/ },

/***/ "http"
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
(module) {

module.exports = require("http");

/***/ },

/***/ "https"
/*!************************!*\
  !*** external "https" ***!
  \************************/
(module) {

module.exports = require("https");

/***/ },

/***/ "mongodb"
/*!**************************!*\
  !*** external "mongodb" ***!
  \**************************/
(module) {

module.exports = require("mongodb");

/***/ },

/***/ "net"
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
(module) {

module.exports = require("net");

/***/ },

/***/ "node-forge"
/*!*****************************!*\
  !*** external "node-forge" ***!
  \*****************************/
(module) {

module.exports = require("node-forge");

/***/ },

/***/ "node:crypto"
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
(module) {

module.exports = require("node:crypto");

/***/ },

/***/ "node:dns"
/*!***************************!*\
  !*** external "node:dns" ***!
  \***************************/
(module) {

module.exports = require("node:dns");

/***/ },

/***/ "node:path"
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
(module) {

module.exports = require("node:path");

/***/ },

/***/ "socks-proxy-agent"
/*!************************************!*\
  !*** external "socks-proxy-agent" ***!
  \************************************/
(module) {

module.exports = require("socks-proxy-agent");

/***/ },

/***/ "stream"
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
(module) {

module.exports = require("stream");

/***/ },

/***/ "stream/promises"
/*!**********************************!*\
  !*** external "stream/promises" ***!
  \**********************************/
(module) {

module.exports = require("stream/promises");

/***/ },

/***/ "tls"
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
(module) {

module.exports = require("tls");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./bin/app.ts");
/******/ 	
/******/ })()
;