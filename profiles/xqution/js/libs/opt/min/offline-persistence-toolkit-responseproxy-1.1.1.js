/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define("fetchStrategies",["./persistenceManager","./persistenceUtils","./impl/defaultCacheHandler","./impl/logger"],function(e,t,n,r){"use strict";function i(i){i=i||{};var s=i.serverResponseCallback,o=i.backgroundFetch,u=o=="disabled"?!0:!1;return u&&(s=null),!s&&!u&&(s=function(e,t){return Promise.resolve(t)}),function(i,o){r.log("Offline Persistence Toolkit fetchStrategies: Processing CacheFirstStrategy");if(s)var u=function(r,i){var u=t.buildEndpointKey(r);n.registerEndpointOptions(u,o);var a={};return t._cloneResponse(i,{url:r.url}).then(function(e){return s(r,e)}).then(function(t){return a.resolvedResponse=t,e.getCache().hasMatch(r,{ignoreSearch:!0})}).then(function(n){var i=a.resolvedResponse.clone();return n?a.resolvedResponse==null||!!t.isCachedResponse(a.resolvedResponse)||r.method!="GET"&&r.method!="HEAD"?i:e.getCache().put(r,a.resolvedResponse).then(function(){return i}):i}).then(function(e){return n.unregisterEndpointOptions(u),Promise.resolve(e)})};return a(i,o,u)}}function s(){return function(n,i){return r.log("Offline Persistence Toolkit fetchStrategies: Processing CacheIfOfflineStrategy"),e.isOnline()?e.browserFetch(n).then(function(e){return e.ok?t._cloneResponse(e,{url:n.url}):o(n,e,i)},function(e){return r.log(e),a(n,i)}):a(n,i)}}function o(e,t,n){return t.status<500?(r.log("Offline Persistence Toolkit fetchStrategies: Response is not ok"),Promise.resolve(t)):a(e,n)}function u(t){return e.getCache().match(t,{ignoreSearch:!0})}function a(t,n,i){return new Promise(function(s,o){r.log("Offline Persistence Toolkit fetchStrategies: Process queryParams for Request"),l(t,n).then(function(n){n?(s(n.clone()),f(t,i)):(r.log("Offline Persistence Toolkit fetchStrategies: Response for queryParams is not null"),u(t).then(function(n){n?(r.log("Offline Persistence Toolkit fetchStrategies: Cached Response is not null"),s(n),f(t,i)):(r.log("Offline Persistence Toolkit fetchStrategies: Cached Response is null"),e.browserFetch(t).then(function(e){var n=e.clone();s(n),i&&i(t,e);return},function(e){var t={status:503,statusText:"No cached response exists"};s(new Response(null,t))}))}))})})}function f(n,i){i&&(r.log("Offline Persistence Toolkit fetchStrategies: Fetch for ServerResponseCallback"),e.browserFetch(n).then(function(e){t._cloneResponse(e,{url:n.url}).then(function(e){i(n,e)})}))}function l(e,t){var n=c(t);return n==null?Promise.resolve():n(e,t)}function c(e){var t=null;return e["queryHandler"]!=null&&(t=e.queryHandler),t}return{getCacheFirstStrategy:i,getCacheIfOfflineStrategy:s}}),define("cacheStrategies",["./persistenceManager","./persistenceUtils","./impl/logger"],function(e,t,n){"use strict";function r(){return function(e,t){return i(e,t).then(function(t){return s(e,t)}).then(function(t){return o(e,t)}).then(function(t){return u(e,t)}).then(function(t){return a(e,t)}).then(function(t){return l(e,t)})}}function i(e,r){var i=r.headers.get("Expires"),s=r.headers.get("x-oracle-jscpt-cache-expiration-date");return i&&t.isCachedResponse(r)&&(!s||s.length==0)&&(r.headers.set("x-oracle-jscpt-cache-expiration-date",i),n.log("Offline Persistence Toolkit cacheStrategies: Set x-oracle-jscpt-cache-expiration-date header based on HTTP Expires header")),Promise.resolve(r)}function s(e,r){var i=c(r.headers,"max-age");if(i!=null&&t.isCachedResponse(r)){var s=e.headers.get("Date");s||(s=(new Date).toUTCString());var o=(new Date(s)).getTime(),u=o+1e3*i,a=new Date(u);r.headers.set("x-oracle-jscpt-cache-expiration-date",a.toUTCString()),n.log("Offline Persistence Toolkit cacheStrategies: Set x-oracle-jscpt-cache-expiration-date header based on HTTP max-age header")}return Promise.resolve(r)}function o(r,i){var s=r.headers.get("If-Match"),o=r.headers.get("If-None-Match");if(s||o){if(!!e.isOnline())return h(r,i,!1);var u=i.headers.get("ETag");if(s&&u.indexOf(s)<0)return t.responseToJSON(i).then(function(e){return e.status=412,e.statusText="If-Match failed due to no matching ETag while offline",n.log("Offline Persistence Toolkit cacheStrategies: Returning Response status 412 based on ETag and HTTP If-Match header"),t.responseFromJSON(e)});if(o&&u.indexOf(o)>=0)return t.responseToJSON(i).then(function(e){return e.status=412,e.statusText="If-None-Match failed due to matching ETag while offline",n.log("Offline Persistence Toolkit cacheStrategies: Returning Response status 412 based on ETag and HTTP If-None-Match header"),t.responseFromJSON(e)})}return Promise.resolve(i)}function u(e,t){var r=c(t.headers,"must-revalidate");if(r){var i=t.headers.get("x-oracle-jscpt-cache-expiration-date");if(i){var s=(new Date(i)).getTime(),o=(new Date).getTime();if(o>s)return n.log("Offline Persistence Toolkit cacheStrategies: Handling revalidation HTTP must-revalidate header"),h(e,t,!0)}}return Promise.resolve(t)}function a(e,t){return f(e,t)?h(e,t):Promise.resolve(t)}function f(e,t){if(c(t.headers,"no-cache"))return n.log("Offline Persistence Toolkit cacheStrategies: Has HTTP no-cache header"),!0;var r=e.headers.get("Pragma"),i=r&&r.trim()==="no-cache";return i&&n.log("Offline Persistence Toolkit cacheStrategies: Has HTTP Pragma no-cache header"),i}function l(e,r){var i=c(r.headers,"no-store");return i!=null?(t.isCachedResponse(r)&&r.headers.delete("x-oracle-jscpt-cache-expiration-date"),n.log("Offline Persistence Toolkit cacheStrategies: Has HTTP no-store header"),Promise.resolve(r)):p(e,r)}function c(e,t){var n=e.get("Cache-Control");if(n){var r=n.split(","),i,s,o;for(i=0;i<r.length;i++){s=r[i].trim();if(s.indexOf(t)===0)return o=s.split("="),o.length>1?o[1].trim():!0}}return null}function h(r,i,s){return t.isCachedResponse(i)?e.isOnline()?e.browserFetch(r).then(function(t){return t.status==304?i:e.getCache().delete(r).then(function(){return n.log("Offline Persistence Toolkit cacheStrategies: Removing old entry based on HTTP revalidation"),t})}):s?t.responseToJSON(i).then(function(e){return e.status=504,e.statusText="cache-control: must-revalidate failed due to application being offline",n.log("Offline Persistence Toolkit cacheStrategies: Returning Response status 504 based HTTP revalidation"),t.responseFromJSON(e)}):Promise.resolve(i):Promise.resolve(i)}function p(r,i){if(i==null||!!t.isCachedResponse(i)||r.method!="GET"&&r.method!="HEAD")return Promise.resolve(i);var s=i.clone();return e.getCache().put(r,i).then(function(){return n.log("Offline Persistence Toolkit cacheStrategies: Cached Request/Response"),s})}return{getHttpCacheHeaderStrategy:r}}),define("defaultResponseProxy",["./persistenceManager","./persistenceUtils","./fetchStrategies","./cacheStrategies","./persistenceStoreManager","./impl/defaultCacheHandler","./impl/logger"],function(e,t,n,r,i,s,o){"use strict";function u(e){e=e||{},e["fetchStrategy"]==null&&(e.fetchStrategy=n.getCacheIfOfflineStrategy()),e["cacheStrategy"]==null&&(e.cacheStrategy=r.getHttpCacheHeaderStrategy()),e.requestHandlerOverride=e.requestHandlerOverride||{},e["requestHandlerOverride"]["handleGet"]==null&&(e.requestHandlerOverride.handleGet=this.handleGet),e["requestHandlerOverride"]["handlePost"]==null&&(e.requestHandlerOverride.handlePost=this.handlePost),e["requestHandlerOverride"]["handlePut"]==null&&(e.requestHandlerOverride.handlePut=this.handlePut),e["requestHandlerOverride"]["handlePatch"]==null&&(e.requestHandlerOverride.handlePatch=this.handlePatch),e["requestHandlerOverride"]["handleDelete"]==null&&(e.requestHandlerOverride.handleDelete=this.handleDelete),e["requestHandlerOverride"]["handleHead"]==null&&(e.requestHandlerOverride.handleHead=this.handleHead),e["requestHandlerOverride"]["handleOptions"]==null&&(e.requestHandlerOverride.handleOptions=this.handleOptions),Object.defineProperty(this,"_options",{value:e})}function a(e){return new u(e)}function f(e,t){var n=e,r=n._options,i=null;return t.method==="POST"?i=r.requestHandlerOverride.handlePost:t.method==="GET"?i=r.requestHandlerOverride.handleGet:t.method==="PUT"?i=r.requestHandlerOverride.handlePut:t.method==="PATCH"?i=r.requestHandlerOverride.handlePatch:t.method==="DELETE"?i=r.requestHandlerOverride.handleDelete:t.method==="HEAD"?i=r.requestHandlerOverride.handleHead:t.method==="OPTIONS"&&(i=r.requestHandlerOverride.handleOptions),i}function l(t){if(!e.isOnline()){var n={status:503,statusText:"Must provide handlePost override for offline"};return Promise.resolve(new Response(null,n))}return e.browserFetch(t)}function c(e,t){var n=e,r=n._options.fetchStrategy;return r(t,n._options)}function h(t,n){var r=t;return e.isOnline()?e.browserFetch(n.clone()).then(function(e){return e.ok?(o.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok for default PUT Handler"),e):m(r,n,e,p)},function(e){return p(r,n)}):p(r,n)}function p(e,n){return o.log("Offline Persistence Toolkit DefaultResponseProxy: Processing offline logic for default PUT Handler"),t.requestToJSON(n).then(function(e){e.status=200,e.statusText="OK",e.headers["content-type"]="application/json",e.headers["x-oracle-jscpt-cache-expiration-date"]="";var n=e.headers["if-match"],r=e.headers["if-none-match"];if(n||r){o.log("Offline Persistence Toolkit DefaultResponseProxy: Generating ETag for offline Response for default PUT Handler");var i=Math.floor(Math.random()*1e6);e.headers.etag=(Date.now()+i).toString(),e.headers["x-oracle-jscpt-etag-generated"]=e.headers.etag,delete e.headers["if-match"],delete e.headers["if-none-match"]}return t.responseFromJSON(e)})}function d(t,n){var r=t;return e.isOnline()?e.browserFetch(n.clone()).then(function(e){return e.ok?(o.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok for default DELETE Handler"),e):m(r,n,e,v)},function(e){return v(r,n)}):v(r,n)}function v(e,n){var r=e;return o.log("Offline Persistence Toolkit DefaultResponseProxy: Processing offline logic for default DELETE Handler"),t.requestToJSON(n).then(function(e){return e.status=200,e.statusText="OK",e.headers["content-type"]="application/json",e.headers["x-oracle-jscpt-cache-expiration-date"]="",t.responseFromJSON(e).then(function(s){var o=g(n),u=null;return r._options&&r._options.jsonProcessor&&r._options.jsonProcessor.shredder&&(u=r._options.jsonProcessor.shredder),u?u(s).then(function(n){if(n){var r=n[0].name;return i.openStore(r).then(function(n){return n.findByKey(o).then(function(n){return n?t.responseFromJSON(e).then(function(e){return t.setResponsePayload(e,n).then(function(e){return e})}):s})})}return s}):s})})}function m(e,t,n,r){var i=e;return n.status<500?Promise.resolve(n):r(i,t)}function g(e){var t=e.url.split("/");return t[t.length-1]}function y(e,t,n){var r=e;if(t.method==="GET"||t.method==="HEAD"){var i=r._options.cacheStrategy;return i(t,n,r._options)}return Promise.resolve(n)}function b(t,n,r){return!e.isOnline()||r?e.getSyncManager().insertRequest(t,{undoRedoDataArray:n}):Promise.resolve()}function w(t,n){return t.method=="GET"||t.method=="HEAD"?e.getCache().hasMatch(t,{ignoreSearch:!0}).then(function(e){return e?E(t,n):Promise.resolve()}):E(t,n)}function E(e,t){return s.constructShreddedData(e,t).then(function(t){return t?S(e,t):Promise.resolve()})}function S(e,t){var n=[];return t.forEach(function(t){var r=Object.keys(t)[0];n.push(x(e,r,t[r]))}),Promise.all(n)}function x(e,t,n){return T(e,t,n).then(function(r){return e.method==="DELETE"?C(t,n,r):N(t,n,r)})}function T(e,t,n){var r=[],s,o,u=function(n,a){return n<a.length&&e.method!=="GET"&&e.method!=="HEAD"?(s=a[n].key.toString(),e.method!=="DELETE"?o=a[n].value:o=null,i.openStore(t).then(function(e){return e.findByKey(s).then(function(e){return r.push({key:s,undo:e,redo:o}),u(++n,a)},function(e){return r.push({key:s,undo:null,redo:o}),u(++n,a)})})):Promise.resolve(r)};return u(0,n)}function N(e,t,n){return i.openStore(e).then(function(e){return e.upsertAll(t)}).then(function(){return n.length>0?{storeName:e,operation:"upsert",undoRedoData:n}:null})}function C(e,t,n){return i.openStore(e).then(function(e){return e.removeByKey(t[0].key)}).then(function(){return n.length>0?{storeName:e,operation:"remove",undoRedoData:n}:null})}return u.prototype.getFetchEventListener=function(){var e=this;return function(t){t.respondWith(e.processRequest(t.request))}},u.prototype.processRequest=function(e){var n=this,r=t.buildEndpointKey(e);return new Promise(function(i,u){s.registerEndpointOptions(r,n._options);var a=f(n,e),l={},c=e.clone();o.log("Offline Persistence Toolkit DefaultResponseProxy: Calling requestHandler for request with enpointKey: "+r),a.call(n,e).then(function(i){return t.isCachedResponse(i)&&(o.log("Offline Persistence Toolkit DefaultResponseProxy: Response is cached for request with enpointKey: "+r),l.isCachedResponse=!0),i.ok?(o.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok for request with enpointKey: "+r),y(n,e,i)):(o.log("Offline Persistence Toolkit DefaultResponseProxy: Response is not ok for request with enpointKey: "+r),i)}).then(function(t){return l.response=t,t.ok?(o.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok after cacheStrategy for request with enpointKey: "+r),w(e,t)):(o.log("Offline Persistence Toolkit DefaultResponseProxy: Response is not ok after cacheStrategy for request with enpointKey: "+r),null)}).then(function(t){return b(e,t,l.isCachedResponse)}).then(function(){s.unregisterEndpointOptions(r),i(l.response)}).catch(function(e){o.log("Offline Persistence Toolkit DefaultResponseProxy: Insert Response in syncManager after error for request with enpointKey: "+r),b(c,null,!0).then(function(){s.unregisterEndpointOptions(r),u(e)},function(){s.unregisterEndpointOptions(r),u(e)})})})},u.prototype.handlePost=function(e){return o.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default POST Handler"),l(e)},u.prototype.handleGet=function(e){return o.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default GET Handler"),c(this,e)},u.prototype.handleHead=function(e){return o.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default HEAD Handler"),c(this,e)},u.prototype.handleOptions=function(e){return o.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default OPTIONS Handler"),l(e)},u.prototype.handlePut=function(e){return o.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default PUT Handler"),h(this,e)},u.prototype.handlePatch=function(e){return o.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default PATCH Handler"),l(e)},u.prototype.handleDelete=function(e){return o.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default DELETE Handler"),d(this,e)},{getResponseProxy:a}}),define("simpleJsonShredding",["./persistenceUtils","./impl/logger"],function(e,t){"use strict";function i(e){if(!e||e.length!==1)throw new Error({message:"shredded data is not in the correct format."});var t=e[0].data;return t&&t.length===1&&e[0].resourceType==="single"?t[0]:t}var n=function(e,n){return function(r){t.log("Offline Persistence Toolkit simpleJsonShredding: Shredding Response");var i=r.clone(),s=i.headers.get("Etag");return i.text().then(function(r){var i=[],o=[],u="collection";if(r&&r.length>0)try{var a=JSON.parse(r);Array.isArray(a)?(i=a.map(function(e){return e[n]}),o=a):(i[0]=a[n],o[0]=a,u="single")}catch(f){t.log("Offline Persistence Toolkit simpleRestJsonShredding: Error during shredding: "+f)}return[{name:e,resourceIdentifier:s,keys:i,data:o,resourceType:u}]})}},r=function(){return function(n,r){return t.log("Offline Persistence Toolkit simpleJsonShredding: Unshredding Response"),Promise.resolve().then(function(){var t=i(n);return e.setResponsePayload(r,t)}).then(function(e){return e.headers.set("x-oracle-jscpt-cache-expiration-date",""),Promise.resolve(e)})}};return{getShredder:n,getUnshredder:r}}),define("oracleRestJsonShredding",["./persistenceUtils","./impl/logger"],function(e,t){"use strict";function i(e,t){if(!e||e.length!==1)throw new Error({message:"shredded data is not in the correct format."});var n,r=e[0].data;return r&&r.length===1&&e[0].resourceType==="single"?n=r[0]:n={items:r,count:r.length},n}var n=function(e,n){return function(r){t.log("Offline Persistence Toolkit oracleRestJsonShredding: Shredding Response");var i=r.clone(),s=i.headers.get("X-ORACLE-DMS-ECID");return i.text().then(function(r){var i=[],o=[],u="collection";if(r!=null&&r.length>0)try{var a=JSON.parse(r);a.items!=null?(i=a.items.map(function(e){return e[n]}),o=a.items):(i[0]=a[n],o[0]=a,u="single")}catch(f){t.log("Offline Persistence Toolkit oracleRestJsonShredding: Error during shredding: "+f)}return[{name:e,resourceIdentifier:s,keys:i,data:o,resourceType:u}]})}},r=function(){return function(n,r){t.log("Offline Persistence Toolkit oracleRestJsonShredding: Unshredding Response");var s=i(n,r);return e.setResponsePayload(r,s).then(function(e){return e.headers.set("x-oracle-jscpt-cache-expiration-date",""),e})}};return{getShredder:n,getUnshredder:r}}),define("simpleBinaryDataShredding",["./persistenceUtils"],function(e){"use strict";function r(e){if(!e||e.length!==1)throw new Error({message:"shredded data is not in the correct format."});var t=e[0].data;return t&&t.length===1&&e[0].resourceType==="single"?t[0]:t}var t=function(e){return function(t){var n=t.clone(),r=n.headers.get("Etag");return n.blob().then(function(n){var i=[],s=[];return i[0]=t.url==null||t.url.length==0?t.headers.get("x-oracle-jscpt-response-url"):t.url,s[0]=n,[{name:e,resourceIdentifier:r,keys:i,data:s,resourceType:"single"}]})}},n=function(){return function(t,n){var i=r(t);return e.setResponsePayload(n,i).then(function(e){return e.headers.set("x-oracle-jscpt-cache-expiration-date",""),Promise.resolve(e)})}};return{getShredder:t,getUnshredder:n}}),define("queryHandlers",["./persistenceManager","./persistenceStoreManager","./persistenceUtils","./impl/logger"],function(e,t,n,r){"use strict";function i(e,t){return t=t||function(e){return o(e,null)},function(i,o){if(i.method=="GET"||i.method=="HEAD"){r.log("Offline Persistence Toolkit queryHandlers: OracleRestQueryHandler processing request");var u=i.url.split("?"),a={},l,c;typeof URLSearchParams=="undefined"?c=f(u[1]):c=(new URLSearchParams(u[1])).entries();var h,p,d,v,m;do h=c.next(),h["value"]!=null&&(p=h.value[0],d=h.value[1],p=="q"?l=d:p=="limit"?v=d:p=="offset"&&(m=d));while(!h.done);var a=t(l),g,y;o["jsonProcessor"]!=null&&(g=o.jsonProcessor.shredder,y=o.jsonProcessor.unshredder);if(g!=null&&y!=null)return s(i,e,a,g,y,m,v).then(function(e){if(!e)return Promise.resolve();var t=e.clone();return t.text().then(function(t){if(t!=null&&t.length>0)try{var r=JSON.parse(t);return r.links?Promise.resolve(e):(r.links=[{rel:"self",href:i.url}],n.setResponsePayload(e,r).then(function(e){return Promise.resolve(e)}))}catch(s){}})})}return Promise.resolve()}}function s(r,i,s,o,u,a,f){return e.getCache().hasMatch(r,{ignoreSearch:!0}).then(function(l){return t.openStore(i).then(function(e){if(l)return e.find(s);var t=c(r);return t?e.findByKey(t):Promise.resolve([])}).then(function(t){return e.getCache().match(r,{ignoreSearch:!0}).then(function(s){if(s){var l=!1;return t&&(a&&a>0&&(a<t.length?l=!0:l=!1,t=t.slice(a,t.length)),f&&f>0&&(f<=t.length?l=!0:l=!1,t=t.slice(0,f))),o(s).then(function(e){var r=e[0].resourceType,o={name:i,data:t,resourceType:r};return u([o],s).then(function(e){var t=e.clone();return t.text().then(function(t){if(!(t!=null&&t.length>0))return e;try{var r=JSON.parse(t);return r.items!=null&&(f&&(r.limit=parseInt(f,10)),a&&(r.offset=parseInt(a,10)),r.hasMore=l),n.setResponsePayload(e,r)}catch(i){}})})})}if(t&&Object.keys(t).length>0){var c=h(r);return c?n.requestToJSON(r).then(function(r){return r.url=c,n.requestFromJSON(r).then(function(n){return e.getCache().match(n,{ignoreSearch:!0}).then(function(e){if(e){var n={name:i,data:[t],resourceType:"single"};return u([n],e)}})})}):Promise.resolve()}return Promise.resolve()})})})}function o(e){var t={};if(e){var n=e.split(";"),r,i,s={};for(r=0;r<n.length;r++){i=n[r].split("=")[0];if(i){var o=n[r].split("=")[1].replace(/^"|'(.*)'|"$/,"$1");s["value."+i]=o}}Object.keys(s).length>0&&(t.selector=s)}return t}function u(e,t){return function(n,i){if(n.method=="GET"||n.method=="HEAD"){r.log("Offline Persistence Toolkit queryHandlers: SimpleQueryHandler processing request");var o=n.url.split("?"),u=a(o,t),f,l;i["jsonProcessor"]!=null&&(f=i.jsonProcessor.shredder,l=i.jsonProcessor.unshredder);if(f!=null&&l!=null)return s(n,e,u,f,l)}return Promise.resolve()}}function a(e,t){var n={};if(e&&e.length>1){var r={},i;typeof URLSearchParams=="undefined"?i=f(e[1]):i=(new URLSearchParams(e[1])).entries();var s,o,u;do{s=i.next();if(s["value"]!=null){o=s.value[0],u=s.value[1];if(!t||t.indexOf(o)==-1)r["value."+o]=u}}while(!s.done);Object.keys(r).length>0&&(n.selector=r)}return n}function f(e){var t=[];if(e!=null){e.charAt(0)==="?"&&(e=e.slice(1)),e=e||"";var n=e.split("&"),r,i,s;t=n.map(function(e){return s=e.indexOf("="),s>-1?(r=e.slice(0,s),i=e.slice(s+1),i=l(i)):(r=e,i=""),r=l(r),[r,i]})}var o={next:function(){var e=t.shift();return{done:e===undefined,value:e}}};return o}function l(e){return decodeURIComponent(e.replace(/\+/g," "))}function c(e){var t=e.url.split("/");return t.length>1?t[t.length-1]:null}function h(e){var t=e.url.split("/");if(t.length>1){var n=c(e);return e.url.substring(0,e.url.length-n.length-1)}return null}return{getSimpleQueryHandler:u,getOracleRestQueryHandler:i}});